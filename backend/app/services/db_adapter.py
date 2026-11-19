"""
Database abstraction layer for CampusFix AI.
Supports SQLite/SQLAlchemy for local development and Amazon DynamoDB for AWS serverless cloud deployment.
"""
import os
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from app.core.config import settings

class ComplaintRepositoryInterface(ABC):
    @abstractmethod
    def get_by_id(self, complaint_id: int) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_by_ticket(self, ticket_number: str) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    def list_complaints(
        self, 
        user_id: Optional[int] = None, 
        status: Optional[str] = None, 
        category: Optional[str] = None, 
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def create_complaint(self, data: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    def update_complaint(self, complaint_id: int, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        pass


class DynamoDBComplaintRepository(ComplaintRepositoryInterface):
    """
    Amazon DynamoDB implementation for serverless AWS deployment.
    
    Data Modeling Design:
      - PK: COMPLAINT#{id}
      - SK: METADATA
      - GSI1 (CategoryIndex): HASH = Category, RANGE = SK
      - GSI2 (StatusIndex): HASH = Status, RANGE = SK
      
    Required IAM Permissions:
      - dynamodb:GetItem
      - dynamodb:PutItem
      - dynamodb:UpdateItem
      - dynamodb:Query
      - dynamodb:Scan
    """
    def __init__(self):
        self.table_name = settings.AWS_DYNAMODB_TABLE
        self.region = settings.AWS_REGION
        self.table = None
        try:
            import boto3
            dynamodb = boto3.resource("dynamodb", region_name=self.region)
            self.table = dynamodb.Table(self.table_name)
        except Exception as e:
            self.table = None

    def get_by_id(self, complaint_id: int) -> Optional[Dict[str, Any]]:
        if not self.table:
            return None
        try:
            response = self.table.get_item(
                Key={"PK": f"COMPLAINT#{complaint_id}", "SK": "METADATA"}
            )
            return response.get("Item")
        except Exception as e:
            print(f"DynamoDB get_by_id error: {e}")
            return None

    def get_by_ticket(self, ticket_number: str) -> Optional[Dict[str, Any]]:
        if not self.table:
            return None
        try:
            from boto3.dynamodb.conditions import Attr
            response = self.table.scan(
                FilterExpression=Attr("ticket_number").eq(ticket_number),
                Limit=1
            )
            items = response.get("Items", [])
            return items[0] if items else None
        except Exception as e:
            print(f"DynamoDB get_by_ticket error: {e}")
            return None

    def list_complaints(
        self, 
        user_id: Optional[int] = None, 
        status: Optional[str] = None, 
        category: Optional[str] = None, 
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        if not self.table:
            return []
        try:
            from boto3.dynamodb.conditions import Key, Attr
            # If status filter provided, query StatusIndex GSI
            if status and status.lower() != "all":
                response = self.table.query(
                    IndexName="StatusIndex",
                    KeyConditionExpression=Key("Status").eq(status),
                    Limit=limit
                )
                items = response.get("Items", [])
            # If category filter provided, query CategoryIndex GSI
            elif category and category.lower() != "all":
                response = self.table.query(
                    IndexName="CategoryIndex",
                    KeyConditionExpression=Key("Category").eq(category),
                    Limit=limit
                )
                items = response.get("Items", [])
            else:
                # Scan table for complaints
                response = self.table.scan(
                    FilterExpression=Attr("SK").eq("METADATA"),
                    Limit=limit
                )
                items = response.get("Items", [])

            # Filter by user_id if requested
            if user_id:
                items = [item for item in items if item.get("user_id") == user_id]

            return items
        except Exception as e:
            print(f"DynamoDB list_complaints error: {e}")
            return []

    def create_complaint(self, data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.table:
            return data
        try:
            item = dict(data)
            cid = item.get("id") or int(datetime.now(timezone.utc).timestamp())
            item["PK"] = f"COMPLAINT#{cid}"
            item["SK"] = "METADATA"
            item["Category"] = item.get("category", "Other")
            item["Status"] = item.get("status", "Submitted")
            item["created_at"] = item.get("created_at", datetime.now(timezone.utc).isoformat())
            self.table.put_item(Item=item)
            return item
        except Exception as e:
            print(f"DynamoDB create_complaint error: {e}")
            return data

    def update_complaint(self, complaint_id: int, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not self.table:
            return None
        try:
            expr_parts = []
            expr_names = {}
            expr_values = {}

            for k, v in updates.items():
                safe_k = f"#{k}"
                safe_v = f":{k}"
                expr_parts.append(f"{safe_k} = {safe_v}")
                expr_names[safe_k] = k
                expr_values[safe_v] = v

            # Keep Status and Category in sync if updated
            if "status" in updates:
                expr_parts.append("#Status = :status_val")
                expr_names["#Status"] = "Status"
                expr_values[":status_val"] = updates["status"]

            if "category" in updates:
                expr_parts.append("#Category = :cat_val")
                expr_names["#Category"] = "Category"
                expr_values[":cat_val"] = updates["category"]

            update_expr = "SET " + ", ".join(expr_parts)
            response = self.table.update_item(
                Key={"PK": f"COMPLAINT#{complaint_id}", "SK": "METADATA"},
                UpdateExpression=update_expr,
                ExpressionAttributeNames=expr_names,
                ExpressionAttributeValues=expr_values,
                ReturnValues="ALL_NEW"
            )
            return response.get("Attributes")
        except Exception as e:
            print(f"DynamoDB update_complaint error: {e}")
            return None


class SQLAlchemyComplaintRepository(ComplaintRepositoryInterface):
    """
    SQLAlchemy implementation for local development using SQLite.
    """
    def __init__(self, db_session):
        self.db = db_session

    def get_by_id(self, complaint_id: int):
        from app.models.complaint import Complaint
        return self.db.query(Complaint).filter(Complaint.id == complaint_id).first()

    def get_by_ticket(self, ticket_number: str):
        from app.models.complaint import Complaint
        return self.db.query(Complaint).filter(Complaint.ticket_number == ticket_number).first()

    def list_complaints(self, user_id: Optional[int] = None, status: Optional[str] = None, category: Optional[str] = None, limit: int = 100):
        from app.models.complaint import Complaint
        query = self.db.query(Complaint)
        if user_id:
            query = query.filter(Complaint.user_id == user_id)
        if status and status.lower() != "all":
            query = query.filter(Complaint.status == status)
        if category and category.lower() != "all":
            query = query.filter(Complaint.category == category)
        return query.limit(limit).all()

    def create_complaint(self, data: Dict[str, Any]):
        from app.models.complaint import Complaint
        complaint = Complaint(**data)
        self.db.add(complaint)
        self.db.commit()
        self.db.refresh(complaint)
        return complaint

    def update_complaint(self, complaint_id: int, updates: Dict[str, Any]):
        from app.models.complaint import Complaint
        complaint = self.db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not complaint:
            return None
        for k, v in updates.items():
            setattr(complaint, k, v)
        self.db.commit()
        self.db.refresh(complaint)
        return complaint

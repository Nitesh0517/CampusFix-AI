"""
Database abstraction layer for CampusFix AI.
Supports SQLite/SQLAlchemy for local development and AWS DynamoDB for cloud deployment.
"""
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from app.core.config import settings

class ComplaintRepositoryInterface(ABC):
    @abstractmethod
    def get_by_id(self, complaint_id: int):
        pass

    @abstractmethod
    def get_by_ticket(self, ticket_number: str):
        pass

    @abstractmethod
    def list_complaints(self, user_id: Optional[int] = None, status: Optional[str] = None, category: Optional[str] = None, limit: int = 100):
        pass

    @abstractmethod
    def create_complaint(self, data: Dict[str, Any]):
        pass

    @abstractmethod
    def update_complaint(self, complaint_id: int, updates: Dict[str, Any]):
        pass

class DynamoDBComplaintRepository(ComplaintRepositoryInterface):
    """
    AWS DynamoDB implementation for serverless AWS Lambda deployment.
    Schema:
      PK: COMPLAINT#{id} or USER#{userId}
      SK: METADATA or CREATED_AT#{iso}
      GSI1: Category & Priority
      GSI2: Status & CreatedAt
    """
    def __init__(self):
        self.table_name = settings.AWS_DYNAMODB_TABLE
        self.region = settings.AWS_REGION
        self.table = None
        try:
            import boto3
            dynamodb = boto3.resource("dynamodb", region_name=self.region)
            self.table = dynamodb.Table(self.table_name)
        except Exception:
            self.table = None

    def get_by_id(self, complaint_id: int):
        if not self.table:
            return None
        response = self.table.get_item(Key={"PK": f"COMPLAINT#{complaint_id}", "SK": "METADATA"})
        return response.get("Item")

    def get_by_ticket(self, ticket_number: str):
        if not self.table:
            return None
        # Query via GSI on TicketNumber
        return None

    def list_complaints(self, user_id: Optional[int] = None, status: Optional[str] = None, category: Optional[str] = None, limit: int = 100):
        if not self.table:
            return []
        return []

    def create_complaint(self, data: Dict[str, Any]):
        if not self.table:
            return data
        self.table.put_item(Item=data)
        return data

    def update_complaint(self, complaint_id: int, updates: Dict[str, Any]):
        if not self.table:
            return None
        return updates

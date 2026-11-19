import re
import json
import httpx
from typing import Dict, Any, List, Optional
from app.core.config import settings

VALID_CATEGORIES = [
    "Hostel",
    "Internet/Wi-Fi",
    "Electricity",
    "Water Supply",
    "Classroom",
    "Library",
    "Mess/Food",
    "Cleanliness",
    "Infrastructure",
    "Security",
    "Other"
]

VALID_PRIORITIES = ["Low", "Medium", "High", "Urgent"]

KEYWORD_CATEGORY_MAP = {
    "Internet/Wi-Fi": [
        "wifi", "wi-fi", "internet", "router", "lan", "ethernet", "bandwidth", "disconnect", 
        "offline", "connection", "network", "signal", "ping", "dns", "portal", "speed", "hotspot"
    ],
    "Electricity": [
        "electricity", "power", "light", "lights", "fan", "bulb", "tube", "tubelight", "switch", 
        "socket", "plug", "outlet", "spark", "blackout", "voltage", "fuse", "mcb", "tripping", "short circuit"
    ],
    "Water Supply": [
        "water", "tap", "pipe", "leak", "leaking", "cooler", "purifier", "geyser", "shower", 
        "flush", "drainage", "plumbing", "faucet", "overflow", "sink", "hot water", "no water"
    ],
    "Mess/Food": [
        "food", "mess", "meal", "breakfast", "lunch", "dinner", "canteen", "stale", "undercooked", 
        "insects", "insect", "worm", "hygiene", "rotten", "taste", "utensil", "plate", "dining"
    ],
    "Cleanliness": [
        "clean", "dirty", "dust", "garbage", "trash", "dustbin", "sweep", "mop", "smell", "stink", 
        "odor", "washroom", "toilet", "restroom", "stain", "waste", "unhygienic", "pest"
    ],
    "Classroom": [
        "classroom", "projector", "screen", "mic", "microphone", "speaker", "podium", "blackboard", 
        "whiteboard", "marker", "bench", "desk", "lecture", "hall", "lhc", "audio"
    ],
    "Library": [
        "library", "book", "reading", "study", "cubicle", "silence", "noise", "chair", "stack", 
        "borrow", "reserve", "seating", "seat"
    ],
    "Security": [
        "security", "theft", "stolen", "guard", "gate", "cctv", "camera", "harassment", "lock", 
        "trespass", "stranger", "threat", "fight", "emergency", "lost", "id card"
    ],
    "Infrastructure": [
        "lift", "elevator", "door", "window", "stairs", "staircase", "crack", "wall", "ceiling", 
        "pothole", "road", "pavement", "railing", "tiles", "roof", "gym", "ground"
    ],
    "Hostel": [
        "hostel", "wing", "room", "bed", "cupboard", "almirah", "warden", "corridor", "balcony"
    ]
}

URGENT_KEYWORDS = [
    "spark", "fire", "smoke", "flood", "broken lock", "stolen", "theft", "insect", "worm", 
    "medical", "injury", "electric shock", "short circuit", "severe leak", "emergency", "gas leak", "hazard"
]

HIGH_KEYWORDS = [
    "blackout", "no water", "exam tomorrow", "no wifi", "submission", "exam", "both lifts", 
    "overflow", "sewage", "dead", "power cut", "urgent", "broken", "offline"
]

LOW_KEYWORDS = [
    "paint", "cosmetic", "squeak", "loose", "scratch", "dim", "request", "suggest", "slow", "minor"
]

class AIService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY

    async def analyze_complaint(self, description: str, title: Optional[str] = None, campus_location: Optional[str] = None) -> Dict[str, Any]:
        """
        Analyzes complaint description and context.
        Attempts Gemini API when key is available, and falls back seamlessly to rule-based heuristics.
        """
        if self.api_key:
            try:
                gemini_result = await self._call_gemini_api(description, title, campus_location)
                if gemini_result:
                    return gemini_result
            except Exception as e:
                # Log or handle Gemini fallback gracefully
                pass
        
        # Rule-based fallback
        return self._heuristic_analysis(description, title, campus_location)

    async def _call_gemini_api(self, description: str, title: Optional[str], campus_location: Optional[str]) -> Optional[Dict[str, Any]]:
        prompt = f"""
You are the AI triage engine for CampusFix AI at a premier university campus.
Analyze the following student complaint and return a strictly valid JSON object without markdown fences or code blocks:

Complaint Title: {title or 'Not specified'}
Reported Location: {campus_location or 'Not specified'}
Full Description: {description}

Categories allowed: ["Hostel", "Internet/Wi-Fi", "Electricity", "Water Supply", "Classroom", "Library", "Mess/Food", "Cleanliness", "Infrastructure", "Security", "Other"]
Priorities allowed: ["Low", "Medium", "High", "Urgent"]

JSON format required:
{{
  "category": "one of the allowed categories",
  "priority": "one of the allowed priorities",
  "location_hint": "extracted location or building hint if detected, or null",
  "summary": "1-sentence professional summary (under 120 chars)",
  "confidence": 0.95,
  "reasoning": "brief 1-sentence rationale for the category and priority",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}}
"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json"
            }
        }
        
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code == 200:
                data = response.json()
                content_text = data["candidates"][0]["content"]["parts"][0]["text"]
                cleaned_text = re.sub(r"^```json\s*", "", content_text.strip(), flags=re.MULTILINE)
                cleaned_text = re.sub(r"```$", "", cleaned_text.strip(), flags=re.MULTILINE)
                parsed = json.loads(cleaned_text)
                
                # Sanitize and validate
                category = parsed.get("category", "Other")
                if category not in VALID_CATEGORIES:
                    category = "Other"
                    
                priority = parsed.get("priority", "Medium")
                if priority not in VALID_PRIORITIES:
                    priority = "Medium"
                    
                return {
                    "category": category,
                    "priority": priority,
                    "location_hint": parsed.get("location_hint"),
                    "summary": parsed.get("summary", description[:100]),
                    "confidence": float(parsed.get("confidence", 0.94)),
                    "reasoning": parsed.get("reasoning", "Categorized via Gemini AI Campus Model"),
                    "keywords": parsed.get("keywords", []),
                    "source": "gemini"
                }
        return None

    def _heuristic_analysis(self, description: str, title: Optional[str] = None, campus_location: Optional[str] = None) -> Dict[str, Any]:
        """
        High accuracy rule-based NLP engine using semantic vocabulary,
        urgency triggers, and campus entity recognition.
        """
        text = f"{title or ''} {description}".lower()
        
        # 1. Category Matching
        scores: Dict[str, int] = {cat: 0 for cat in VALID_CATEGORIES}
        matched_keywords: List[str] = []
        
        for cat, keywords in KEYWORD_CATEGORY_MAP.items():
            for kw in keywords:
                # Word boundary match
                pattern = r'\b' + re.escape(kw) + r'\b'
                matches = len(re.findall(pattern, text))
                if matches > 0:
                    scores[cat] += matches * 2
                    if kw not in matched_keywords:
                        matched_keywords.append(kw)

        # Contextual boosts
        if "wifi" in text or "wi-fi" in text or "internet" in text:
            scores["Internet/Wi-Fi"] += 10
        if "spark" in text or "short circuit" in text or "electric" in text or "power" in text or "mcb" in text:
            scores["Electricity"] += 10
        if "water" in text or "tap" in text or "leak" in text or "cooler" in text or "drain" in text:
            scores["Water Supply"] += 10
        if "food" in text or "mess" in text or "meal" in text or "roti" in text or "dal" in text:
            scores["Mess/Food"] += 10
        if "ac" in text and ("classroom" in text or "lhc" in text or "lecture" in text or "hall" in text):
            scores["Classroom"] += 8
        if "projector" in text or "mic" in text or "speaker" in text:
            scores["Classroom"] += 10
        if "washroom" in text or "toilet" in text or "garbage" in text or "stink" in text:
            scores["Cleanliness"] += 10
        if "theft" in text or "stolen" in text or "guard" in text or "cctv" in text:
            scores["Security"] += 10
        if "lift" in text or "elevator" in text or "pothole" in text:
            scores["Infrastructure"] += 10
            
        best_category = max(scores, key=scores.get)
        if scores[best_category] == 0:
            best_category = "Other"

        # 2. Priority Calculation
        priority = "Medium"
        reasoning = "Standard issue requiring maintenance team review."
        
        for uk in URGENT_KEYWORDS:
            if re.search(r'\b' + re.escape(uk) + r'\b', text):
                priority = "Urgent"
                reasoning = f"Urgent safety/health hazard detected matching '{uk}'."
                break
                
        if priority != "Urgent":
            for hk in HIGH_KEYWORDS:
                if re.search(r'\b' + re.escape(hk) + r'\b', text):
                    priority = "High"
                    reasoning = f"High campus impact issue matching '{hk}'."
                    break
                    
        if priority == "Medium":
            for lk in LOW_KEYWORDS:
                if re.search(r'\b' + re.escape(lk) + r'\b', text):
                    priority = "Low"
                    reasoning = f"Cosmetic or low-impact maintenance request matching '{lk}'."
                    break

        # 3. Location Hint Extraction
        location_hint = campus_location
        loc_patterns = [
            r'(hostel\s*\d+[a-z]?)',
            r'(h-?\s*\d+)',
            r'(lecture\s*hall\s*complex|lhc\s*\d*)',
            r'(central\s*library|library)',
            r'(computer\s*centre|cc\s*lab)',
            r'(main\s*building)',
            r'(sac\s*building|gymkhana)',
            r'(wing\s*[a-d])',
            r'(room\s*\d+)',
            r'(floor\s*\d+)'
        ]
        for pat in loc_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                location_hint = m.group(1).title()
                break

        # 4. Concise Summary Generation
        first_sentence = description.split('.')[0].strip()
        first_sentence = re.sub(r'^(hi|hello|sir|madam|please|i am facing|there is an issue with|i want to report)\s*', '', first_sentence, flags=re.IGNORECASE).strip()
        if len(first_sentence) > 90:
            first_sentence = first_sentence[:87] + "..."
        summary = first_sentence.capitalize() if first_sentence else f"{best_category} issue reported."

        confidence = 0.92 if scores[best_category] >= 4 else (0.85 if scores[best_category] > 0 else 0.65)

        return {
            "category": best_category,
            "priority": priority,
            "location_hint": location_hint,
            "summary": summary,
            "confidence": confidence,
            "reasoning": reasoning,
            "keywords": matched_keywords[:5],
            "source": "heuristic-fallback"
        }

ai_service = AIService()

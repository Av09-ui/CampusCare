import re
from typing import List, Tuple, Dict, Any


KEYWORDS_CATEGORY = {
    "IT": [
        "wifi", "wi-fi", "internet", "network", "portal", "login", "password", 
        "server", "laptop", "computer", "system", "software", "website", "lan",
        "printer", "scanner", "router"
    ],
    "ACADEMIC": [
        "exam", "examination", "grade", "grading", "professor", "faculty", "teacher",
        "lecture", "syllabus", "assignment", "course", "curriculum", "marks", "quiz",
        "attendance", "schedule", "class"
    ],
    "FOOD": [
        "food", "mess", "canteen", "lunch", "dinner", "breakfast", "meal", 
        "hygiene", "catering", "drinking water", "water cooler", "snack", "taste"
    ],
    "HOUSING": [
        "hostel", "dorm", "room", "bed", "warden", "roommate", "hall", "almirah",
        "corridor", "balcony"
    ],
    "FACILITIES": [
        "library", "gym", "sports", "court", "lab", "laboratory", "bench", 
        "chair", "projector", "whiteboard", "blackboard", "auditorium", "ground"
    ],
    "SAFETY": [
        "security", "guard", "safety", "theft", "stolen", "harassment", "ragging", 
        "threat", "emergency", "fire", "danger", "fight", "cctv"
    ],
    "INFRASTRUCTURE": [
        "fan", "ac", "air conditioner", "light", "bulb", "electricity", "power", 
        "power cut", "leak", "leakage", "pipe", "plumbing", "washroom", "toilet", 
        "bathroom", "lift", "elevator", "door", "window", "roof", "broken"
    ],
}

KEYWORDS_PRIORITY = {
    "CRITICAL": [
        "emergency", "fire", "ragging", "harassment", "danger", "electric shock", 
        "spark", "severe injury", "violence", "threat", "immediate", "gas leak"
    ],
    "HIGH": [
        "urgent", "flood", "leakage", "broken door", "no power", "power cut", 
        "blackout", "no water", "exam tomorrow", "cannot login", "exam issue", "stolen"
    ],
    "LOW": [
        "suggestion", "minor", "cosmetic", "paint", "enhancement", "request", 
        "inconvenience", "slow"
    ],
}


def analyze_complaint_text(description: str) -> Tuple[str, str]:
    """
    Returns (category, priority) based on natural language heuristic classification.
    """
    text_lower = description.lower()

    # Determine priority
    detected_priority = "MEDIUM"
    for priority, keywords in KEYWORDS_PRIORITY.items():
        if any(re.search(r"\b" + re.escape(kw) + r"\b", text_lower) for kw in keywords):
            detected_priority = priority
            break

    # Determine category
    category_scores: Dict[str, int] = {}
    for cat, keywords in KEYWORDS_CATEGORY.items():
        score = sum(1 for kw in keywords if re.search(r"\b" + re.escape(kw) + r"\b", text_lower))
        if score > 0:
            category_scores[cat] = score

    if category_scores:
        detected_category = max(category_scores.items(), key=lambda x: x[1])[0]
    else:
        detected_category = "OTHER"

    return detected_category, detected_priority


def find_similar_complaints(description: str, existing_complaints: List[Any], current_id: int = None, limit: int = 3) -> List[Dict[str, Any]]:
    """
    Find existing complaints that have high word overlap with the new/target complaint.
    """
    def tokenize(text: str) -> set:
        words = re.findall(r"\b\w{3,}\b", text.lower())
        stopwords = {
            "the", "and", "is", "in", "at", "which", "on", "this", "that", "there",
            "with", "for", "from", "are", "have", "has", "not", "but", "all", "our"
        }
        return set(w for w in words if w not in stopwords)

    target_tokens = tokenize(description)
    if not target_tokens:
        return []

    matches = []
    for comp in existing_complaints:
        if current_id and comp.id == current_id:
            continue
        comp_tokens = tokenize(comp.description)
        if not comp_tokens:
            continue
        intersection = target_tokens.intersection(comp_tokens)
        union = target_tokens.union(comp_tokens)
        if not union:
            continue
        jaccard = len(intersection) / len(union)
        if jaccard >= 0.2:  # 20% word overlap threshold
            matches.append({
                "id": comp.id,
                "description": comp.description,
                "similarity_score": round(jaccard, 2),
            })

    matches.sort(key=lambda x: x["similarity_score"], reverse=True)
    return matches[:limit]

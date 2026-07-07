import re
from typing import TypedDict, List
from langgraph.graph import StateGraph, END
from .crew import execute_crew_research

# Definicion del diccionario de datos para el estado de la noticia a lo largo del grafo
class NewsState(TypedDict):
    raw_text: str
    crew_report: str
    verdict: str
    score: int
    iteration_count: int
    summary: str
    evidence: List[str]

# funciones de los nodos del grafo
def crew_node(state: NewsState):
    # se invoca a la tripulacion de CrewAI para realizar la investigacion
    text = state["raw_text"]
    report = execute_crew_research(text)
    return {"crew_report": report}

def evaluation_node(state: NewsState):
    # se procesa el reporte de CrewAI y estructura el formato final
    report = state["crew_report"]
    report_lower = report.lower()
    
    # Lógica de extracción del veredicto (Esto se puede mejorar con un LLM de extracción JSON)
    final_verdict = "none"
    if "verdadera" in report_lower: final_verdict = "verdadera"
    elif "falsa" in report_lower: final_verdict = "falsa"
    elif "engañosa" in report_lower: final_verdict = "engañosa"
    elif "sarcástica" in report_lower: final_verdict = "sarcástica"

    # Extracción dinámica del score usando Regex
    score = 0 # Valor por defecto en caso de que el LLM no devuelva un número
    
    # Se busca el patrón de un número seguido de "/ 100"
    match = re.search(r'(\d{1,3})\s*/\s*100', report)
    if match:
        score = int(match.group(1)) # se extrae solo el número
    else:
        # Plan de respaldo: buscar un número cerca de la palabra "credibilidad"
        match_backup = re.search(r'credibilidad.*?(\d{1,3})', report_lower)
        if match_backup:
            score = int(match_backup.group(1))

    # Extracción del resumen: primer párrafo significativo (> 80 caracteres)
    summary = ""
    paragraphs = re.split(r'\n\s*\n', report.strip())
    for para in paragraphs:
        clean = para.strip()
        if len(clean) > 80:
            summary = clean[:500]
            break

    # Extracción de URLs de evidencia (dominios de noticias/sitios web)
    evidence_urls = []
    url_pattern = re.compile(r'https?://[^\s\)\]}>"\']+')
    raw_urls = url_pattern.findall(report)
    seen = set()
    for url in raw_urls:
        cleaned = url.rstrip('.,;:!?)')
        if cleaned not in seen:
            seen.add(cleaned)
            evidence_urls.append(cleaned)
    
    return {
        "verdict": final_verdict,
        "score": score,
        "summary": summary,
        "evidence": evidence_urls
    }

def evaluar_ciclo(state: NewsState):
    # Si falta evidencia, se regresaría a investigar más a fondo (reiterar el ciclo de CrewAI)
    if state["verdict"] == "none" and state["iteration_count"] < 2:
        return "nodo_crew" # Bucle
    return END

# construcción del grafo
workflow = StateGraph(NewsState)

workflow.add_node("nodo_crew", crew_node)
workflow.add_node("nodo_evaluacion", evaluation_node)

workflow.set_entry_point("nodo_crew")
workflow.add_edge("nodo_crew", "nodo_evaluacion")
workflow.add_conditional_edges("nodo_evaluacion", evaluar_ciclo)

# se compila la aplicación LangGraph
workflow_app = workflow.compile()

# Función de Entrada Principal (Gatillo para FastAPI)
async def execute_analysis(news_text: str):
    """
    Esta es la función a importar en el archivo main.py de FastAPI
    """
    initial_state = {
        "raw_text": news_text,
        "crew_report": "",
        "verdict": "none",
        "score": 0,
        "iteration_count": 0,
        "summary": "",
        "evidence": []
    }
    
    # ainvoke procesa el grafo de manera asíncrona
    result = await workflow_app.ainvoke(initial_state)
    
    return {
        "verdict": result["verdict"],
        "score": result["score"],
        "summary": result.get("summary", ""),
        "evidence": result.get("evidence", []),
        "report": result.get("crew_report", "")
    }
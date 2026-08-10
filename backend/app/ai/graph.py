# import re
from typing import TypedDict, List
from langgraph.graph import StateGraph, END
from .crew import execute_crew_research

# Definicion del diccionario de datos para el estado de la noticia a lo largo del grafo
class NewsState(TypedDict):
    raw_text: str
    crew_report_raw: dict # ahora es explicitamente un diccionario
    verdict: str
    score: int
    iteration_count: int
    summary: str
    evidence: List[str]
    report_text: str # para la terminal visual

# funciones de los nodos del grafo
def crew_node(state: NewsState):
    # se invoca a la tripulacion de CrewAI para realizar la investigacion
    text = state["raw_text"]
    # crew.py AHORA DEVUELVE UN DICCIONARIO
    crew_result_dict = execute_crew_research(text)
    
    return {"crew_report_raw": crew_result_dict}

def evaluation_node(state: NewsState):
    # Ya no usamos Regex. Solo leemos las claves del diccionario perfecto de CrewAI.
    result_dict = state.get("crew_report_raw", {})
    
    # Extraemos con fallback de seguridad
    verdict = result_dict.get("verdict", "none")
    # Limpieza básica por si la IA devuelve "Sátira" en mayúsculas
    verdict = str(verdict).lower()
    
    score = result_dict.get("score", 0)
    # Por seguridad, si el score viene como string ("100"), lo convertimos a entero
    try:
        score = int(score)
    except (ValueError, TypeError):
        score = 0
        
    summary = result_dict.get("summary", "El análisis finalizó, pero no se pudo generar el resumen.")
    evidence = result_dict.get("evidence", [])
    report_text = result_dict.get("report", "Reporte detallado no disponible.")
    
    # Si la IA falló por completo y nos devolvió texto plano en report_text en vez de un dict real:
    if not isinstance(result_dict, dict):
        report_text = str(result_dict)
        verdict = "falsa"
        score = 0
    
    return {
        "verdict": verdict,
        "score": score,
        "summary": summary,
        "evidence": evidence,
        "report_text": report_text
    }

def evaluar_ciclo(state: NewsState):
    # Ya no necesitamos que itere, porque CrewAI ya te garantiza un JSON estructurado. 
    # Además, reiterar gasta tokens masivamente.
    # Cortamos el ciclo directamente al final.
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
        "crew_report_raw": {},
        "verdict": "none",
        "score": 0,
        "iteration_count": 0,
        "summary": "",
        "evidence": [],
        "report_text": ""
    }
    
    # ainvoke procesa el grafo de manera asíncrona
    result = await workflow_app.ainvoke(initial_state)
    
    # Ahora LangGraph devuelve el empaquetado final perfecto para main.py
    return {
        "verdict": result["verdict"],
        "score": result["score"],
        "summary": result["summary"],
        "evidence": result["evidence"],
        "report": result["report_text"]
    }
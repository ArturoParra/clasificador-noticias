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

# funciones de los nodos del grafo
def crew_node(state: NewsState):
    # se invoca a la tripulacion de CrewAI para realizar la investigacion
    text = state["raw_text"]
    report = execute_crew_research(text)
    return {"crew_report": report}

def evaluation_node(state: NewsState):
    # se procesa el reporte de CrewAI y estructura el formato final
    report = state["crew_report"].lower()
    
    # Lógica simplificada de extracción (Esto se puede mejorar con un LLM de extracción JSON)
    final_verdict = "none"
    if "verdadera" in report: final_verdict = "verdadera"
    elif "falsa" in report: final_verdict = "falsa"
    elif "engañosa" in report: final_verdict = "engañosa"
    elif "sarcástica" in report: final_verdict = "sarcástica"

    # Extracción ficticia de score para el ejemplo (Se adaptaría según el formato estricto del LLM)
    score = 50 
    
    return {"verdict": final_verdict, "score": score}

def evaluar_ciclo(state: NewsState):
    # Si falta evidencia, regresaría a investigar (no implementado en V1)
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
        "iteration_count": 0
    }
    
    # ainvoke procesa el grafo de manera asíncrona
    result = await workflow_app.ainvoke(initial_state)
    
    return {
        "verdict": result["verdict"],
        "score": result["score"]
    }
from crewai import Agent, Task, Crew, Process
from langchain_google_genai import GoogleGenerativeAI
import os

# funcion para analisis de la noticia desplegando la tripulación de CrewAI
def execute_crew_research(news_text: str) -> str:
    # inicializacion del LLM de Google GenAI (configurado con la API Key en las variables de entorno)
    gemini_llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-pro",
        gemini_api_key=os.getenv("GEMINI_API_KEY"), 
        temperature=0.7
        )
    # definicion de los Agentes
    researcher = Agent(
        role='Investigador de hechos',
        goal='Rastrear fuentes oficiales, comunicados y medios de alta reputación que permitan más adelante confirmar la veracidad empírica de la noticia.',
        backstory='Eres un periodista de investigación implacable. Tu objetivo es encontrar evidencias concretas que respalden o desmientan la información.',
        verbose=True,
        allow_delegation=False,
        llm=gemini_llm
    )

    linguistic_analyst = Agent(
        role='Analista Lingüístico',
        goal='Identificar patrones de ironía, hipérboles, sensacionalismo y marcadores de sarcasmo.',
        backstory='Eres un experto en lingüística forense y retórica. Sabes leer entre líneas para detectar cuando un texto busca manipular emociones o es puramente satírico.',
        verbose=True,
        allow_delegation=False,
        llm=gemini_llm
    )

    consistency_judge = Agent(
        role='Juez de Consistencia',
        goal='Comparar los hallazgos del investigador y el analista para emitir un veredicto estructurado.',
        backstory='Eres el editor en jefe. Analizas el contexto histórico y los datos crudos para evitar que noticias recicladas o sacadas de contexto pasen como verdaderas.',
        verbose=True,
        allow_delegation=False,
        llm=gemini_llm
    )

    # definicion de las tareas
    research_task = Task(
        description=f'Busca evidencia que confirme o refute esta noticia: "{news_text}". Extrae los hechos clave.',
        expected_output='Un resumen de los hechos verificables encontrados.',
        agent=researcher
    )

    linguistic_analysis_task = Task(
        description=f'Analiza el tono del siguiente texto: "{news_text}". ¿Es neutral, sensacionalista o sarcástico?',
        expected_output='Un reporte sobre el estilo lingüístico y posibles sesgos.',
        agent=linguistic_analyst
    )

    consistency_judge_task = Task(
        description='Revisa los hechos de la investigación y el reporte de estilo. Determina si la noticia es: VERDADERA, FALSA, ENGAÑOSA o SARCÁSTICA. Justifica tu respuesta e incluye una puntuación de credibilidad de 0 a 100.',
        expected_output='Un veredicto final justificado, la categoría (verdadera, falsa, engañosa o sarcástica) y la puntuación de credibilidad (ej. 85).',
        agent=consistency_judge
    )

    # Ensmablaje de la tripulacion
    crew = Crew(
        agents=[researcher, linguistic_analyst, consistency_judge],
        tasks=[research_task, linguistic_analysis_task, consistency_judge_task],
        process=Process.sequential # Ejecución en cascada
    )

    bottom_line = crew.kickoff() # inicio del trabajo
    
    return str(bottom_line)
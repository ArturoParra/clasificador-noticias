from crewai import Agent, Task, Crew, Process
# from langchain_google_genai import ChatGoogleGenerativeAI
# from langchain_tavily import TavilySearch # versión de la comunidad
from langchain_community.tools.tavily_search import TavilySearchResults
from crewai.tools import tool # decorador nativo de CrewAI
import os

# Definimos la herramienta afuera de la función con el decorador de CrewAI
@tool("Motor de busqueda de internet")
def search_tool(query: str) -> str:
    """Util para buscar información en internet sobre noticias, hechos y eventos actuales. Requiere un texto de busqueda."""
    tavily_engine = TavilySearchResults(
        max_results=5,
        search_depth="advanced",
        include_raw_content=True
    )
    # se ejecuta la búsqueda y forzamos a que devuelva todo como texto (string)
    return str(tavily_engine.invoke({"query": query}))

# funcion para analisis de la noticia desplegando la tripulación de CrewAI
def execute_crew_research(news_text: str) -> str:

    # inicializacion del LLM de Google GenAI (configurado con la API Key en las variables de entorno)
    """
    gemini_llm = ChatGoogleGenerativeAI(
        model="gemini-3.5-flash",
        api_key=os.getenv("GOOGLE_API_KEY"),
        thinking_level="high" #el endpoint tardará un poco mas pero se espera un análisis más profundo y detallado
        )
    """
    
    # clave de Google a la variable exacta que busca LiteLLM/CrewAI
    os.environ["GEMINI_API_KEY"] = os.getenv("GOOGLE_API_KEY")
    
    # definicion del modelo con el prefijo nativo "gemini/" para que no se pierda hacia OpenAI
    gemini_model = "gemini/gemini-3.5-flash"
    
    #inicializacion de la herramienta de búsqueda en internet

    """
    search_tool = TavilySearchResults(
        # tavily_api_key=os.getenv("TAVILY_API_KEY"),la lib ya lo hace automaticamente con Pydantic V2
        max_results=5,
        search_depth="advanced",
        include_raw_content=True
        #include_domains=["apnews.com", "reuters.com", "bbc.com"] # limitar la busqueda a medios de alta reputación
    )
    """

    # definicion de los Agentes
    researcher = Agent(
        role='Investigador de hechos',
        goal='Rastrear fuentes oficiales, comunicados y medios de alta reputación que permitan más adelante confirmar la veracidad empírica de la noticia.',
        backstory='Eres un periodista de investigación implacable. Tu objetivo es encontrar evidencias concretas que respalden o desmientan la información.',
        verbose=True,
        allow_delegation=False,
        llm=gemini_model,
        tools=[search_tool] # Pasamos nuestra nueva herramienta nativa de búsqueda a CrewAI
    )

    linguistic_analyst = Agent(
        role='Analista lingüístico',
        goal='Identificar patrones de ironía, hipérboles, sensacionalismo y marcadores de sarcasmo.',
        backstory='Eres un experto en lingüística forense y retórica. Sabes leer entre líneas para detectar cuando un texto busca manipular emociones o es puramente satírico.',
        verbose=True,
        allow_delegation=False,
        llm=gemini_model
    )

    consistency_judge = Agent(
        role='Juez de consistencia y evaluador de fuentes',
        goal='Comparar los hallazgos del investigador y el analista, evaluar la reputación de las fuentes citadas, esto para emitir un veredicto estructurado.',
        backstory='Eres el jefe editor de una agencia global de fact-checking. Sin embargo, eres extremadamente escéptico, y sabes que un blog anónimo no tiene el mismo peso que una ' \
        'agencia de noticias.Analizas el contexto histórico, evalúas la calidad de la URL de origen y los datos crudos para evitar que noticias recicladas, sacadas de contexto o incluso que noticias de sátira pasen como verdaderas.',
        verbose=True,
        allow_delegation=False,
        llm=gemini_model
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
        description='Revisa los hechos documentados de la investigación, las URLs proporcionadas por el investigador y el reporte de estilo del analista. ' \
        'Determina si la noticia es: Verdadera, Falsa, Engañosa o Sátira. CRÍTICO: Evalúa la confiabilidad de las URLs; si la fuente es un sitio de sátira conocido, márcala como Sátira. Si la fuente es dudosa ' \
        'y contradice los hechos reales, márcala como Falsa. Justifica tu respuesta mencionando explícitamente la calidad de las fuentes ' \
        'e incluye una puntuación de credibilidad del 0 al 100.',
        expected_output='Un veredicto final justificado (mencionando las URLs), la categoría (Verdadera, Falsa, Engañosa o Sátira) y la puntuación de credibilidad (ej. 85).',
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
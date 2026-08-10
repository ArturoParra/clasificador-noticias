from crewai import Agent, Task, Crew, Process
# from langchain_google_genai import ChatGoogleGenerativeAI
# from langchain_tavily import TavilySearch # versión de la comunidad
from langchain_community.tools.tavily_search import TavilySearchResults
from crewai.tools import tool # decorador nativo de CrewAI
from datetime import datetime # para manejo de fechas en el análisis de noticias
import os
import json

# Definimos la herramienta afuera de la función con el decorador de CrewAI
@tool("Motor de busqueda de internet")
def search_tool(query: str) -> str:
    """Util para buscar información en internet sobre noticias, hechos y eventos actuales. Requiere un texto de busqueda."""
    tavily_engine = TavilySearchResults(
        max_results=1, # anteriormente 5, pero para optimizar costos y tiempo de respuesta se reduce a 1
        search_depth="advanced",
        include_raw_content=True
    )
    # se ejecuta la búsqueda y forzamos a que devuelva todo como texto (string)
    return str(tavily_engine.invoke({"query": query}))

# funcion para analisis de la noticia desplegando la tripulación de CrewAI
def execute_crew_research(news_text: str) -> str:

    fecha_actual = datetime.now().strftime("%A, %d de %B de %Y") # obtenemos la fecha actual para contextualizar la búsqueda de noticias recientes

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
        max_iter = 3, # comando contra bucles de panico
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
        description=f'Busca evidencia que confirme o refute esta noticia: "{news_text}". Extrae los hechos clave.'
        'REGLA CRÍTICA: Debes usar la herramienta de búsqueda un MÁXIMO de 2 veces.'
        'Si no encuentras información concluyente en esos intentos, detente y reporta exactamente lo que encontraste.',
        expected_output='Un resumen de los hechos verificables encontrados. REGLA ESTRICTA: Incluye ÚNICAMENTE UNA (1) URL principal en la sección "FUENTES ENCONTRADAS".' \
        'Incluye una sección "FUENTE ENCONTRADA:" con la URL de la fuente utilizada.',
        agent=researcher
    )

    linguistic_analysis_task = Task(
        description=f'Analiza el tono del siguiente texto: "{news_text}". ¿Es neutral, sensacionalista o sarcástico?',
        expected_output='Un reporte sobre el estilo lingüístico y posibles sesgos.',
        agent=linguistic_analyst
    )

    consistency_judge_task = Task(
        description=f'CRÍTICO - CONTEXTO TEMPORAL: Hoy es {fecha_actual}. '
        'Revisa los hechos documentados, la ÚNICA URL proporcionada por el investigador y el reporte de estilo del analista. ' 
        'Determina si la noticia es: Verdadera, Falsa, Engañosa o Sátira. '
        'REGLA DE PUNTUACIÓN: La puntuación (0 al 100) evalúa la VERACIDAD de la afirmación, NO la calidad de la fuente que usaste para investigar. Si es Sátira = 0, si es Falsa = 0, Engañosa = 10-50, Verdadera = 80-100. '
        'REGLA DE FORMATO: Tu respuesta final debe ser ÚNICA y EXCLUSIVAMENTE un objeto JSON válido. Prohibido usar prefijos, saludos o bloques de código Markdown (```json).',
        expected_output='''Un objeto JSON exacto y parseable con esta estructura estricta:
        {
            "verdict": "verdadera" | "falsa" | "engañosa" | "sátira",
            "score": <número entero>,
            "summary": "Resumen breve del veredicto.",
            "evidence": ["url_de_la_fuente_encontrada"],
            "report": "### 1) Análisis de IA... (aquí va todo tu desglose detallado con Markdown para la terminal)"
        }''',
        agent=consistency_judge
    )

    # Ensmablaje de la tripulacion
    crew = Crew(
        agents=[researcher, linguistic_analyst, consistency_judge],
        tasks=[research_task, linguistic_analysis_task, consistency_judge_task],
        max_rpm=4,
        process=Process.sequential # Ejecución en cascada
    )

    bottom_line = crew.kickoff() # inicio del trabajo
    
    # PARSEO SEGURO A DICCIONARIO
    
    # 1. Convertimos la salida a texto crudo
    result_str = str(bottom_line)
    
    # 2. Limpiamos cualquier bloque Markdown (```json) que Gemini haya colado
    result_str = result_str.replace("```json", "").replace("```", "").strip()
    
    # 3. Convertimos el texto a Diccionario y lo retornamos
    try:
        return json.loads(result_str)
    except json.JSONDecodeError as e:
        print(f"Error fatal parseando el JSON: {e}")
        # Paracaídas de emergencia para que el backend nunca colapse
        return {
            "verdict": "falsa",
            "score": 0,
            "summary": "El análisis finalizó, pero hubo un error de formato en la respuesta de la IA.",
            "evidence": [],
            "report": result_str
        }
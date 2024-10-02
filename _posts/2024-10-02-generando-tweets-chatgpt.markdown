---
layout: single
title:  "Automatizando tuits con ChatGPT"
date:   2024-10-02 21:06:00 +0000
categories: aprendiendo
---

## Automatización de Tuits con IA

Este fin de semana me animé a experimentar un poco con algunas APIs y terminé construyendo un pequeño sistema que automatiza la creación y publicación de tuits. La idea era aprender y, de paso, mostrar cómo ahora mismo, con las nuevas herramientas de IA generativa, cualquiera puede crear cosas que hace nada eran imposibles o muy costosas en tiempo.

Mi idea inicial era, con la ayuda de ChatGPT, automatizar un resumen de los tuits de algún tuitero al que sigo, pero el modo de acceso gratuito a la API de Twitter no te lo permite. Actualmente solo te deja consultar la información de tu perfil o publicar tuits.

Así que le planteé a ChatGPT construir un código en Python que hiciese lo siguiente:

- Buscar noticias recientes sobre **OpenAI**.
- Generar un tuit atractivo, breve y con hashtags que se ajustasen al tema usando la API de ChatGPT.
- Publicar el tuit generado por ChatGPT con la API de Twitter.

A la vez le pedí que me sugiriera formas de hacerlo fácil y sin costo. Así fue cómo, por ejemplo, me propuso usar el "feed" RSS de Google News para recuperar alguna noticia actual sobre **OpenAI** o utilizar **Bitly** para acortar los enlaces. ¡Grandes aportes!

A partir de ahí, la creación del código fue un proceso iterativo de prueba y error, con muy pocos errores por parte de ChatGPT, por cierto.

Dejo por aquí el código Python final. 

### Código Python

```python
import feedparser
import openai
from openai import OpenAI
import bitlyshortener
import tweepy
from tweepy.errors import TweepyException

# Claves y tokens de las APIs
# OpenAI
openai_api_key = 'TU_API_KEY_OPENAI'

# Bitly
bitly_tokens = ['TU_BITLY_TOKEN']

# Twitter
consumer_key = 'TU_CONSUMER_KEY_TWITTER'
consumer_secret = 'TU_CONSUMER_SECRET_TWITTER'
access_token = 'TU_ACCESS_TOKEN_TWITTER'
access_token_secret = 'TU_ACCESS_SECRET_TWITTER'

# Paso 1: Obtener la noticia de Google News
feed_url = "https://news.google.com/rss/search?q=OpenAI&hl=en&gl=US&ceid=US:en"
feed = feedparser.parse(feed_url)

if len(feed.entries) > 0:
    first_entry = feed.entries[0]
    title = first_entry.title
    link = first_entry.link
else:
    print("No se encontraron noticias sobre 'OpenAI'.")
    exit()

# Paso 2: Acortar el enlace con Bitly
shortener = bitlyshortener.Shortener(tokens=bitly_tokens, max_cache_size=256)
enlace_acortado = shortener.shorten_urls([link])[0]

# Paso 3: Generar el tuit con OpenAI
client = OpenAI(api_key=openai_api_key)
prompt = (
    f"Genera un tuit breve y llamativo sobre esta noticia titulada '{title}'. "
    f"Incluye el enlace acortado: {enlace_acortado}. "
    "Añade los hashtags: #OpenAI #IA #GeneradoPorIA. Mantén el tuit por debajo de 280 caracteres."
)

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": prompt}],
    max_tokens=50,
    temperature=0.7
)
tuit = response.choices[0].message.content.strip()

# Paso 4: Publicar el tuit con Tweepy
auth = tweepy.OAuth1UserHandler(
    consumer_key, consumer_secret,
    access_token, access_token_secret
)
client_twitter = tweepy.Client(
    consumer_key=consumer_key,
    consumer_secret=consumer_secret,
    access_token=access_token,
    access_token_secret=access_token_secret
)

try:
    response_twitter = client_twitter.create_tweet(text=tuit)
    print('Tweet publicado exitosamente.')
    print(f'ID del Tweet: {response_twitter.data["id"]}')
except TweepyException as e:
    print(f'Error al publicar el tweet: {e}')
    if e.response is not None and e.response.text is not None:
        print(f'Detalles del error: {e.response.text}')

```





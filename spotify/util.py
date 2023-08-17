from .models import *
from django.utils import timezone
from datetime import timedelta
from .credentials import CLIENT_ID, CLIENT_SECRET
from requests import post,put,get

BASE_URL = "https://api.spotify.com/v1/me/"

def get_user_tokens(session_id):
    user_tokens=Spotify_Token.objects.filter(user=session_id)
    if user_tokens.exists():
        return user_tokens[0]
    else:
        return None
        


def update_or_create_user_tokens(session_id,access_token,expires_in,token_type,refresh_token):
    tokens = get_user_tokens(session_id)
    expires_in = timezone.now()+ timedelta(seconds=expires_in)
    
    if tokens:
        tokens.access_token = access_token
        tokens.refresh_token = refresh_token
        tokens.token_type = token_type
        tokens.expires_in = expires_in
        tokens.save(update_fields=['refresh_token','access_token','expires_in','token_type'])
    else:
        tokens = Spotify_Token(user=session_id,refresh_token=refresh_token,access_token=access_token,expires_in=expires_in,token_type=token_type)
        tokens.save()
        
        
def if_authenticated(session_id):
    tokens=get_user_tokens(session_id)
    if tokens:
        expiry = tokens.expires_in
        if expiry <=timezone.now():
            refresh_spotify_tokens(session_id)
        return True
            
    return False

def refresh_spotify_tokens(session_id):
    refresh_token = get_user_tokens(session_id).refresh_token
    response = post('https://accounts.spotify.com/api/token',data={
        'grant_type':'refresh_token',
        'refresh_token':refresh_token,
        'client_id':CLIENT_ID,
        'client_secret':CLIENT_SECRET,
    })
    
    print("Status Code:", response.status_code)
    
    response = response.json()
    
    
    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')
    # refresh_token = response.get('refresh_token')
    update_or_create_user_tokens(session_id,access_token,expires_in,token_type,refresh_token)


def execute_call(session_id, endpoint, post_=False, put_=False):
    tokens = get_user_tokens(session_id)
    header = {'content-type':'application/json',
              'Authorization': "Bearer " + tokens.access_token
              }
    if post_:
        post(BASE_URL + endpoint,headers=header)
    if put_:
        put(BASE_URL + endpoint,headers=header)
    
    response = get(BASE_URL + endpoint, {},headers=header)
    try: 
        return response.json()
    except:
        return {"Issue":"No Song Being played Right Now "}
    
    
def play_song(session_id):
    return execute_call(session_id, "player/play", put_=True)
    
    
def pause_song(session_id):
    return execute_call(session_id, "player/pause", put_=True)

def Skip(session_id):
    return execute_call(session_id,'player/next',post_=True)
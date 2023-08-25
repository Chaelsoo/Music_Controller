from django.shortcuts import render
from .credentials import REDIRECT_URI,CLIENT_ID,CLIENT_SECRET
from rest_framework.decorators import api_view
from requests import Request,post
from rest_framework import status 
from rest_framework.response import Response
from .util import *
from django.shortcuts import redirect
from api.models import *
from .models import *



@api_view(["GET"])
def AuthURL(request):
    scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'
    url = 'https://accounts.spotify.com/authorize' + f'?scope={scopes}&response_type=code&redirect_uri={REDIRECT_URI}&client_id={CLIENT_ID}'
    return Response({"url":url},status=status.HTTP_200_OK)

    
def spotify_callback(request):
    code = request.GET.get('code')
    error = request.GET.get('error')
    print("hello there")
    
    response = post('https://accounts.spotify.com/api/token',data={
        'grant_type':'authorization_code',
        'code':code,
        'redirect_uri':REDIRECT_URI,
        'client_id':CLIENT_ID,
        'client_secret':CLIENT_SECRET
        }).json()
    
    access_token = response.get('access_token')
    token_type = response.get('token_type')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')
    error = response.get('error')

    
    if not request.session.exists(request.session.session_key):
       request.session.create() 
       
    update_or_create_user_tokens(request.session.session_key,access_token=access_token,expires_in=expires_in,token_type=token_type,refresh_token=refresh_token)
    
    return redirect('frontend:')


@api_view(['GET'])
def IsAuthenticated(request):
    auth = if_authenticated(request.session.session_key)
    return Response({'status':auth},status=status.HTTP_200_OK)





@api_view(['GET'])
def CurrentSong(request):
    roomcode = request.session.get('room_code')
    room = Room.objects.filter(code=roomcode)
    if room.exists():
        room = room[0]
    else:
        return Response({},status=status.HTTP_404_NOT_FOUND)
    host = room.host
    endpoint = "player/currently-playing"
    response = execute_call(host,endpoint)
    if 'error' in response or 'item' not in response:
        return Response({'Issue':'User Logged Off'},status=status.HTTP_204_NO_CONTENT)
    item = response.get('item')
    duration = item.get('duration_ms')
    progress = response.get('progress_ms')
    album_cover = item.get('album').get('images')[0].get('url')
    is_playing = response.get('is_playing')
    song_id = item.get('id')

    
        
    
    artist_string = ""
    
    for i,artist in enumerate(item.get('artists')):
        if i>0:
            artist_string += ", "

        name = artist.get('name')
        artist_string += name
    votes = len(Vote.objects.filter(room=room,song_id=song_id))
    song = {
        'title':item.get('name'),
        'artist':artist_string,
        'duration':duration,
        'time':progress,
        'image_url':album_cover,
        'is_playing':is_playing,
        'votes':votes,
        'votes_required':room.votes_to_skip,
        'id':song_id,
    }
    
    current_song = room.current_song

    if current_song != song_id:
        room.current_song = song_id
        room.save(update_fields=['current_song'])
        votes = Vote.objects.filter(room=room).delete()

    return Response(song,status=status.HTTP_200_OK)
    
    
    
    
@api_view(['PUT'])
def PauseSong(request):
    roomcode = request.session.get('room_code')
    room = Room.objects.filter(code=roomcode)
    if room.exists():
        room = room[0]
        if request.session.session_key == room.host or room.guest_can_pause:
            pause_song(room.host)
            return Response({'Pause':'Successful'},status=status.HTTP_202_ACCEPTED)
        
        return Response({'Error':'Not Allowed'},status=status.HTTP_403_FORBIDDEN)
        
    
@api_view(['PUT'])
def PlaySong(request):
    roomcode = request.session.get('room_code')
    room = Room.objects.filter(code=roomcode)
    if room.exists():
        room = room[0]
        print(room.host)
        if request.session.session_key == room.host or room.guest_can_pause:
            print('room doesnt match ')
            play_song(room.host)
            return Response({'Pause':'Successful'},status=status.HTTP_202_ACCEPTED)

        return Response({'Error':'Not Allowed'},status=status.HTTP_403_FORBIDDEN)
        
        
@api_view(['POST'])
def SkipSong(request):
    roomcode = request.session.get('room_code')
    room = Room.objects.filter(code=roomcode)[0]
    votes = Vote.objects.filter(room=room,song_id=room.current_song)
    votes_needed = room.votes_to_skip   
    
    if request.session.session_key == room.host or len(votes)+ 1 >= votes_needed:
        votes.delete()
        Skip(room.host)
    else:
        vote = Vote(user=request.session.session_key, room=room,song_id=room.current_song)
        vote.save()
        
    
    return Response({'Worked':'i guess '},status=status.HTTP_204_NO_CONTENT)

        
    

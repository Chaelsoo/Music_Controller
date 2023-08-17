from django.contrib import admin
from django.urls import path,include
from .views import *

urlpatterns = [
    path('get-auth/',AuthURL),
    path('redirect/',spotify_callback),
    path('is-authenticated/',IsAuthenticated),
    path('current-song/',CurrentSong),
    path('pause/',PauseSong),
    path('play/',PlaySong),
    path('skip/',SkipSong),
]
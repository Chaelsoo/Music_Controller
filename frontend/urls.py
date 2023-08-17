from django.contrib import admin
from django.urls import path,include
from .views import index


app_name = 'frontend'

urlpatterns = [
    path('',index,name=''),
    path('join/',index),
    path('create/',index), 
    path('room/<str:roomcode>/',index),   
    path('room/<str:roomcode>/settings/',index),
]
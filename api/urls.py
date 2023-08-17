from django.urls import path
from .views import RoomView,CreateRoomView,GetRoom,GetSession,leaveSession,updateroom

urlpatterns = [
    path('',RoomView),
    path('Create-room/',CreateRoomView.as_view()),
    path('join-room/<str:pk>/',GetRoom),
    path('UserInRoom/',GetSession),
    path('leave-room/',leaveSession),
    path('update-room/',updateroom),
]

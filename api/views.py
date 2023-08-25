from django.shortcuts import render
from rest_framework import generics,status
from .serializers import RoomSerializer ,CreateRoomSerializer,UpdateRoomSerializer
from .models import Room
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
import datetime
from django.shortcuts import get_object_or_404
from django.http import JsonResponse


@api_view(['GET'])
def RoomView(request):
    rooms = Room.objects.all()
    room_data = RoomSerializer(rooms,many=True)
    return Response(data=room_data.data,status=200)

class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer
    def post(self,request,format=None):
        print('started')
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
            
        serializer = self.serializer_class(data=request.data)
        print(serializer)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')  
            host = self.request.session.session_key
            print("found",Room.objects.filter(host=host))
            queryset = Room.objects.filter(host=host)
            print("queryset",queryset)
            
            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.created_at = datetime.datetime.now()
                request.session['room_code']=room.code
                room.save(update_fields=['guest_can_pause','votes_to_skip'])
            else:
                room = Room(host=host,guest_can_pause=guest_can_pause,votes_to_skip=votes_to_skip)
                request.session['room_code']=room.code
                room.save()
            
            return Response(RoomSerializer(room).data,status=status.HTTP_201_CREATED)
    
    
@api_view(['GET'])
def GetRoom(request, pk):
    room = get_object_or_404(Room, code=pk)
    serializer = RoomSerializer(room).data
    serializer['is_host'] = request.session.session_key == serializer['host']
    request.session['room_code']=room.code
    return Response(serializer, status=200)
        
        
@api_view(['GET'])
def GetSession(request):
    if not request.session.exists(request.session.session_key):
        request.session.create()
    data = {
        'code':request.session.get('room_code')
    }
    return JsonResponse(data, status=status.HTTP_200_OK)


@api_view(['POST'])
def leaveSession(request):
    if 'room_code' in request.session:
        code = request.session.pop('room_code')
        room = Room.objects.get(code=code)
        if room.host == request.session.session_key:
            room.delete()
        
        return Response({"message":"Success"},status=status.HTTP_200_OK)
    return Response({"error":"Bad Code"},status=status.HTTP_404_NOT_FOUND)
        
@api_view(['PATCH'])
def updateroom(request):
    print("started")
    user_id = request.session.session_key
    if not user_id:
        request.session.create()

    serializer = UpdateRoomSerializer(data=request.data)
    print(serializer)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    code = serializer.validated_data.get("code")
    if not Room.objects.filter(code=code).exists():
        return Response({"Message": "Room Not Found..."}, status=status.HTTP_400_BAD_REQUEST)

    room = Room.objects.get(code=code)
    if room.host != user_id:
        return Response({"Bad Request": "You don't have access..."}, status=status.HTTP_403_BAD_REQUEST)

    room.guest_can_pause = serializer.validated_data.get("guest_can_pause")
    room.votes_to_skip = serializer.validated_data.get("votes_to_skip")
    room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
    
    return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
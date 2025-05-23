from django.http import JsonResponse
from django.shortcuts import render
from agora_token_builder import RtcTokenBuilder
import random
import time
import json
from .models import RoomMember
from django.views.decorators.csrf import csrf_exempt

#token generation

def get_token(request):
       appId = "b6fb6db28ea14b70baf5cd6a448e1f61"
       appCertificate = "43344de1074b48ddb423dcc4f0b3829c"
       channelName = request.GET.get('channel')
       uid = random.randint(1, 230)
       expiration_time_in_seconds = 3600*24
       current_timestamp = time.time()
       privilege_expired_ts = current_timestamp + expiration_time_in_seconds
       role = 1
       if not channelName:
          return JsonResponse({'error': 'Channel name is required'}, status=400)


       token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilege_expired_ts)
       return JsonResponse({"token":token,"uid":uid},safe=False)

def join(request):
    return render(request, "join.html")


def chat(request):
    return render(request, "room.html")

@csrf_exempt
def createUser(request):
    data = json.loads(request.body)
    member , created = RoomMember.objects.get_or_create(name=data['name'], uid=data['UID'], room_name=data['room_name'])

    return JsonResponse({"name": data['name'], "uid": data['name']}, safe=False)


def getUser(request):
    uid = request.GET.get('UID')
    room_name = request.GET.get('room_name')
    
    member = RoomMember.objects.get(uid=uid, room_name=room_name,)
    return JsonResponse({'name': member.name}, safe=False)
    



@csrf_exempt
def DeleteUser(request):
    data = json.loads(request.body)
    member = RoomMember.objects.get(
        uid=data['name'], room_name=data['room_name'],name=data['name'],
    )
    member.delete()
    return JsonResponse("member was daleted", safe=False)

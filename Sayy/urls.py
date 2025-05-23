from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.join, name='join'),  # Add this line
    path('chat/', views.chat, name='chat'),  # Add this line
    path('room/', views.chat, name='room'),  # Add this line
    path('get_token/', views.get_token, name='get_token'),  # Add this line
    path('create_member/', views.createUser, name='create_member'),  # Add this line
    path('get_member/', views.getUser, name='get_member'),  # Add this line
    path('delete_member/', views.DeleteUser, name='delete_member'),  # Add this line
]

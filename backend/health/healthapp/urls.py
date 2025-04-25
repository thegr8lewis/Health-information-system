from django.urls import path
from .views import (
    ProgramListCreate, ProgramRetrieveUpdateDestroy,
    ClientListCreate, ClientRetrieveUpdateDestroy, ClientDetailView,
)

urlpatterns = [
    # Programs URLs
    path('programs/', ProgramListCreate.as_view(), name='program-list-create'),
    path('programs/<int:pk>/', ProgramRetrieveUpdateDestroy.as_view(), name='program-retrieve-update-destroy'),
    
    # Clients URLs
    path('clients/', ClientListCreate.as_view(), name='client-list-create'),
    path('clients/<int:pk>/', ClientRetrieveUpdateDestroy.as_view(), name='client-retrieve-update-destroy'),
    path('clients/<int:client_id>/detail/', ClientDetailView.as_view(), name='client-detail'),
]
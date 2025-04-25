from django.urls import path
from .views import ProgramListCreate, ProgramRetrieveUpdateDestroy

urlpatterns = [
    path('programs/', ProgramListCreate.as_view(), name='program-list-create'),
    path('programs/<int:pk>/', ProgramRetrieveUpdateDestroy.as_view(), name='program-retrieve-update-destroy'),
]
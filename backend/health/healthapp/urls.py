from django.urls import path
from .views import (
    ProgramListCreate, ProgramRetrieveUpdateDestroy,
    ClientListCreate, ClientRetrieveUpdateDestroy,
      ClientDetailView, ProgramClientsView, DashboardStatsView,
        CurrentUserView,  LoginView, SuperUserUpdateView
)

urlpatterns = [
    # Programs URLs
    path('programs/', ProgramListCreate.as_view(), name='program-list-create'),
    path('programs/<int:pk>/', ProgramRetrieveUpdateDestroy.as_view(), name='program-retrieve-update-destroy'),
    
    # Clients URLs
    path('clients/', ClientListCreate.as_view(), name='client-list-create'),
    path('clients/<int:pk>/', ClientRetrieveUpdateDestroy.as_view(), name='client-retrieve-update-destroy'),
    path('clients/<int:client_id>/detail/', ClientDetailView.as_view(), name='client-detail'),
     path('programs/<int:program_id>/clients/', ProgramClientsView.as_view(), name='program-clients'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('auth/user/', CurrentUserView.as_view(), name='current-user'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/superuser/update/', SuperUserUpdateView.as_view(), name='superuser-self-update'),
     
]
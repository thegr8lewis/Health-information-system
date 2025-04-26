from rest_framework import generics, viewsets  # Add viewsets to imports
from .models import Client, Program
from .serializers import ClientSerializer, ProgramSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Avg
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import LoginSerializer
from django.contrib.auth.models import User
from .serializers import SuperUserUpdateSerializer
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated, IsAdminUser

class SuperUserUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser] 

    def get(self, request):
        serializer = SuperUserUpdateSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        return self._update_user(request)

    def patch(self, request):
        return self._update_user(request, partial=True)

    def _update_user(self, request, partial=False):
        serializer = SuperUserUpdateSerializer(
            request.user,
            data=request.data,
            partial=partial
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer.save()
        return Response(
            {"message": "Superuser updated successfully!"},
            status=status.HTTP_200_OK
        )
    

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': {
                    'id': user.id,
                    'name': user.get_full_name(),
                    'email': user.email
                },
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            })
        
        print("🚨 Serializer Errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            'full_name': user.get_full_name(),
            'email': user.email,
            'avatar': user.profile.avatar.url if hasattr(user, 'profile') else None
        }
        return Response(data)


class DashboardStatsView(APIView):
    def get(self, request):
        stats = {
            'total_clients': Client.objects.count(),
            'active_programs': Program.objects.filter(status='active').count(),
            'program_completions': 0,  # Update with your completion logic
            'avg_satisfaction': 4.8    # Update with your satisfaction tracking
        }
        return Response(stats)


class ProgramClientsView(generics.ListAPIView):
    serializer_class = ClientSerializer

    def get_queryset(self):
        program_id = self.kwargs['program_id']
        return Client.objects.filter(program=program_id)

# Client ViewSet
class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        program_id = self.request.query_params.get('program')
        if program_id:
            queryset = queryset.filter(program=program_id)
        return queryset

class ClientDetailView(APIView):
    def get(self, request, client_id):
        try:
            client = Client.objects.get(id=client_id)
            serializer = ClientSerializer(client)
            return Response(serializer.data)
        except Client.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

# Client Views
class ClientListCreate(generics.ListCreateAPIView):
    queryset = Client.objects.all().select_related('program')
    serializer_class = ClientSerializer

class ClientRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Client.objects.all().select_related('program')
    serializer_class = ClientSerializer

# Program Views
class ProgramListCreate(generics.ListCreateAPIView):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer

class ProgramRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
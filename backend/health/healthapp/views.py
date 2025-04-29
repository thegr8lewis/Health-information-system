from rest_framework import generics, viewsets  # Add viewsets to imports
from .models import Client, Program, AdminCreationLog, ClientAccessLog
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
from rest_framework.throttling import UserRateThrottle
from django.utils import timezone
from django.contrib.gis.geoip2 import GeoIP2
from .serializers import AdminCreationSerializer, AdminCreationLogSerializer
from .models import PasswordResetToken
from .serializers import (
    RequestPasswordResetSerializer,
    VerifyResetCodeSerializer,
    ResetPasswordSerializer
)
from django.core.mail import send_mail
from django.conf import settings
import random
import string

class RequestPasswordResetView(APIView):
    def post(self, request):
        serializer = RequestPasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            try:
                user = User.objects.get(email=email)
                
                # Generate a 6-digit code
                code = ''.join(random.choices(string.digits, k=6))
                
                # Create or update password reset token
                PasswordResetToken.objects.filter(user=user, is_used=False).update(is_used=True)
                token = PasswordResetToken.objects.create(user=user, code=code)
                
                # Send email with the code
                send_mail(
                    subject='Password Reset Code',
                    message=f'Your password reset code is: {code}. This code will expire in 10 minutes.',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=False,
                )
                
                return Response({'message': 'Password reset code sent to your email'}, status=status.HTTP_200_OK)
            
            except User.DoesNotExist:
                # Still return success to prevent email enumeration
                return Response({'message': 'If your email is registered, you will receive a reset code'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyResetCodeView(APIView):
    def post(self, request):
        serializer = VerifyResetCodeSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            code = serializer.validated_data['code']
            
            try:
                user = User.objects.get(email=email)
                token = PasswordResetToken.objects.filter(
                    user=user,
                    code=code,
                    is_used=False
                ).latest('created_at')
                
                if token.is_valid:
                    return Response({
                        'message': 'Verification successful',
                        'token': str(token.token)
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'message': 'Verification code has expired'
                    }, status=status.HTTP_400_BAD_REQUEST)
                    
            except (User.DoesNotExist, PasswordResetToken.DoesNotExist):
                return Response({
                    'message': 'Invalid verification code'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResetPasswordView(APIView):
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            token_str = serializer.validated_data['token']
            password = serializer.validated_data['password']
            
            try:
                token = PasswordResetToken.objects.get(token=token_str, is_used=False)
                
                if token.is_valid:
                    user = token.user
                    user.set_password(password)
                    user.save()
                    
                    # Mark token as used
                    token.is_used = True
                    token.save()
                    
                    return Response({
                        'message': 'Password has been reset successfully'
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'message': 'Reset token has expired'
                    }, status=status.HTTP_400_BAD_REQUEST)
                    
            except PasswordResetToken.DoesNotExist:
                return Response({
                    'message': 'Invalid reset token'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminCreationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        serializer = AdminCreationSerializer(data=request.data)
        if serializer.is_valid():
            new_admin = serializer.save()
            
            # Log the admin creation
            AdminCreationLog.objects.create(
                creator=request.user,
                new_admin=new_admin
            )
            
            return Response(
                {"message": "Admin created successfully!"},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminCreationLogView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        logs = AdminCreationLog.objects.all().order_by('-created_at')
        serializer = AdminCreationLogSerializer(logs, many=True)
        return Response(serializer.data)

class ClientAccessLogView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        logs = ClientAccessLog.objects.all().order_by('-access_time')[:50]
        data = [{
            'client_name': f"{log.client.first_name} {log.client.last_name}",
            'accessor_email': log.accessor.email,
            'access_time': log.access_time,
            'ip_address': log.ip_address,
            'location': self._get_location(log.ip_address)
        } for log in logs]
        return Response(data)
    
    def _get_location(self, ip):
        try:
            # Handle local IPs
            if ip in ['127.0.0.1', '::1']:
                return 'Localhost'
        
            return 'Unknown'  #
        except Exception as e:
            print(f"Error getting location for IP {ip}: {str(e)}")
            return 'Unknown'

class ClientProfileAPIView(APIView):
    def get(self, request, client_id):
        try:
            client = Client.objects.get(id=client_id)
            
            # Log the access
            ip_address = request.META.get('REMOTE_ADDR')
            ClientAccessLog.objects.create(
                client=client,
                accessor=request.user,
                ip_address=ip_address
            )
            
            serializer = ClientSerializer(client)
            return Response(serializer.data)
        except Client.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

class ClientAccessLogView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        logs = ClientAccessLog.objects.all().order_by('-access_time')[:50]
        data = [{
            'client_name': f"{log.client.first_name} {log.client.last_name}",
            'accessor_email': log.accessor.email,
            'access_time': log.access_time,
            'ip_address': log.ip_address,
            'location': self.get_location(log.ip_address)
        } for log in logs]
        return Response(data)
    
    def get_location(self, ip):
        try:
            g = GeoIP2()
            return g.city(ip)['city'] or 'Unknown'
        except:
            return 'Unknown'



class SuperUserUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser] 

    def get(self, request):
        serializer = SuperUserUpdateSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = SuperUserUpdateSerializer(
            request.user,
            data=request.data,
            partial=True
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            serializer.save()
            return Response(
                {"message": "User updated successfully!"},
                status=status.HTTP_200_OK
            )
        except serializers.ValidationError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
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
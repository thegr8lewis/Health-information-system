from django.db import models
from django.contrib.auth.models import User

# Add to models.py
class AdminCreationLog(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_admins')
    new_admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_by')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.creator.username} created {self.new_admin.username} at {self.created_at}"

class Program(models.Model):
    ACTIVE = 'active'
    INACTIVE = 'inactive'
    STATUS_CHOICES = [
        (ACTIVE, 'Active'),
        (INACTIVE, 'Inactive'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    duration = models.PositiveIntegerField(help_text="Duration in days")
    category = models.CharField(max_length=50)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=ACTIVE)
    
    def __str__(self):
        return self.name

class Client(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    date_of_birth = models.DateField()
    address = models.TextField()
    program = models.ForeignKey(
        Program,  # Changed from string reference to direct reference now that Program is defined above
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        limit_choices_to={'status': 'active'}
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    def initials(self):
        return f"{self.first_name[0]}{self.last_name[0]}".upper()

class ClientAccessLog(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    accessor = models.ForeignKey(User, on_delete=models.CASCADE)
    access_time = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    
    class Meta:
        ordering = ['-access_time']

    def __str__(self):
        return f"{self.accessor.email} accessed {self.client} at {self.access_time}"
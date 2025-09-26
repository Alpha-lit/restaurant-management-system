from django.db import models
from django.conf import settings
from django.utils import timezone

class Stock(models.Model):
    ingredient = models.OneToOneField('menu.Ingredient', on_delete=models.CASCADE)
    quantity = models.FloatField()
    last_updated = models.DateTimeField(auto_now=True)
    reorder_threshold = models.FloatField()
    
    def __str__(self):
        return f"{self.ingredient.name} - {self.quantity} {self.ingredient.unit}"
    
    @property
    def needs_reorder(self):
        return self.quantity <= self.reorder_threshold

class StockTransaction(models.Model):
    TYPE_CHOICES = (
        ('in', 'Stock In'),
        ('out', 'Stock Out'),
        ('adjustment', 'Adjustment'),
    )
    
    ingredient = models.ForeignKey('menu.Ingredient', on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    quantity = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    
    def __str__(self):
        return f"{self.type} {self.quantity} {self.ingredient.unit} of {self.ingredient.name}"
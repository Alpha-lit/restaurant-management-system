from django.db import models
from orders.models import Order

class DailySales(models.Model):
    date = models.DateField(unique=True)
    total_orders = models.PositiveIntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    average_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    def __str__(self):
        return f"Sales for {self.date}"

class PopularDish(models.Model):
    dish = models.ForeignKey('menu.Dish', on_delete=models.CASCADE)
    order_count = models.PositiveIntegerField(default=0)
    revenue_generated = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    period_start = models.DateField()
    period_end = models.DateField()
    
    class Meta:
        unique_together = ('dish', 'period_start', 'period_end')
    
    def __str__(self):
        return f"{self.dish.name} ({self.period_start} to {self.period_end})"
from django.contrib import admin
from .models import DailySales, PopularDish

@admin.register(DailySales)
class DailySalesAdmin(admin.ModelAdmin):
    list_display = ('date', 'total_orders', 'total_revenue', 'average_order_value')
    list_filter = ('date',)
    ordering = ('-date',)

@admin.register(PopularDish)
class PopularDishAdmin(admin.ModelAdmin):
    list_display = ('dish', 'order_count', 'revenue_generated', 'period_start', 'period_end')
    list_filter = ('period_start', 'period_end')
    ordering = ('-order_count',)
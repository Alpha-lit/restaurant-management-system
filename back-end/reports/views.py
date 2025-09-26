from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import DailySales, PopularDish
from .serializers import DailySalesSerializer, PopularDishSerializer

class DailySalesViewSet(viewsets.ModelViewSet):
    queryset = DailySales.objects.all()
    serializer_class = DailySalesSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['date']
    ordering_fields = ['date', 'total_orders', 'total_revenue']

class PopularDishViewSet(viewsets.ModelViewSet):
    queryset = PopularDish.objects.all()
    serializer_class = PopularDishSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['dish', 'period_start', 'period_end']
    ordering_fields = ['order_count', 'revenue_generated']
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from .models import Order, OrderItem, Payment
from .serializers import OrderSerializer, OrderItemSerializer, PaymentSerializer
import logging

logger = logging.getLogger(__name__)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'table', 'waiter']
    search_fields = ['notes']
    ordering_fields = ['created_at', 'updated_at']
    
    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        order = self.get_object()
        dish_id = request.data.get('dish_id')
        quantity = request.data.get('quantity', 1)
        notes = request.data.get('notes', '')
        
        if not dish_id:
            return Response({'error': 'Dish ID is required'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from menu.models import Dish
            dish = Dish.objects.get(id=dish_id)
        except Dish.DoesNotExist:
            return Response({'error': 'Dish not found'}, 
                           status=status.HTTP_404_NOT_FOUND)
        
        order_item = OrderItem.objects.create(
            order=order,
            dish=dish,
            quantity=quantity,
            notes=notes
        )
        
        serializer = OrderItemSerializer(order_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def make_payment(self, request, pk=None):
        order = self.get_object()
        amount = request.data.get('amount')
        method = request.data.get('method')
        transaction_id = request.data.get('transaction_id')
        
        logger.info(f"Payment request for order {pk}: amount={amount}, method={method}, transaction_id={transaction_id}")
        
        if not amount:
            return Response({'error': 'Amount is required'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        if not method:
            return Response({'error': 'Payment method is required'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        if not transaction_id:
            return Response({'error': 'Transaction ID is required'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Check if payment already exists
        if Payment.objects.filter(order=order).exists():
            return Response({'error': 'Payment already processed for this order'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        payment = Payment.objects.create(
            order=order,
            amount=amount,
            method=method,
            transaction_id=transaction_id
        )
        
        # Update order status to paid
        order.status = 'paid'
        order.save()
        
        serializer = PaymentSerializer(payment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['order', 'method']
    search_fields = ['transaction_id']
    ordering_fields = ['timestamp']
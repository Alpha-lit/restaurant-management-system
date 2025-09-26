from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DailySalesViewSet, PopularDishViewSet

router = DefaultRouter()
router.register(r'daily-sales', DailySalesViewSet)
router.register(r'popular-dishes', PopularDishViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
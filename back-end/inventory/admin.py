from django.contrib import admin
from django.db.models import F
from .models import Stock, StockTransaction

class NeedsReorderFilter(admin.SimpleListFilter):
    title = 'needs reorder'
    parameter_name = 'needs_reorder'

    def lookups(self, request, model_admin):
        return (
            ('yes', 'Yes'),
            ('no', 'No'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'yes':
            return queryset.filter(quantity__lte=F('reorder_threshold'))
        elif self.value() == 'no':
            return queryset.filter(quantity__gt=F('reorder_threshold'))
        return queryset

@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ('ingredient', 'quantity', 'reorder_threshold', 'needs_reorder')
    search_fields = ('ingredient__name',)
    list_filter = (NeedsReorderFilter,)

@admin.register(StockTransaction)
class StockTransactionAdmin(admin.ModelAdmin):
    list_display = ('ingredient', 'type', 'quantity', 'timestamp', 'user')
    list_filter = ('type', 'timestamp')
    search_fields = ('ingredient__name', 'notes')
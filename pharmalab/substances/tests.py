from decimal import Decimal

from django.test import SimpleTestCase

from .models import RequestItem, Substance
from .serializers import RequestItemSerializer


class RequestItemPricingTests(SimpleTestCase):
    def test_item_total_uses_quantity_and_substance_price(self):
        substance = Substance(name='Test substance', cas='50-00-0', price=Decimal('125.50'))
        item = RequestItem(substance=substance, quantity=Decimal('3'))

        self.assertEqual(item.item_total, Decimal('376.50'))

    def test_request_item_serializer_returns_line_total_display(self):
        substance = Substance(
            name='Test substance',
            cas='50-00-0',
            price=Decimal('125.50'),
            unit='кг',
        )
        item = RequestItem(substance=substance, quantity=Decimal('3'))

        data = RequestItemSerializer(item).data

        self.assertEqual(data['item_total'], '376.50')
        self.assertEqual(data['item_total_display'], '376.50 ₽')
        self.assertEqual(data['substance_price_display'], '125.50 ₽/кг')

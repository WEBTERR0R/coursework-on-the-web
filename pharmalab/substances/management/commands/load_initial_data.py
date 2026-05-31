from django.core.management.base import BaseCommand
from django.utils import timezone
from substances.models import User, Substance
from decimal import Decimal


class Command(BaseCommand):
    help = 'Load initial data for pharmalab'

    def handle(self, *args, **options):
        # пользователь для демо
        user, created = User.objects.get_or_create(
            username='demo_user',
            defaults={
                'email': 'demo@pharmalab.ru',
                'created_at': timezone.now()
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created user: {user.username}'))
        else:
            self.stdout.write(f'User exists: {user.username}')
        
        # стартовые субстанции
        substances_data = [
            {
                'name': 'Парацетамол',
                'cas': '103-90-2',
                'description': 'Анальгетик и антипиретик. Используется для производства обезболивающих и жаропонижающих препаратов.',
                'full_description': 'Фармацевтическая субстанция парацетамола. Белый кристаллический порошок, чистота ≥ 99.5%. Применяется в производстве таблеток, капсул, сиропов и растворов для инъекций.',
                'price': Decimal('4500.00'),
                'unit': 'кг',
                'molecular_weight': Decimal('151.16'),
                'storage_conditions': 'Хранить в сухом, защищённом от света месте при температуре 15-25°C',
                'shelf_life': 36,
                'image_key': 'paracetamol.svg',
                'video_key': '',
                'manufacturer': 'Zhejiang NHU Co., Ltd.',
                'country_of_origin': 'Китай',
                'purity': Decimal('99.5'),
                'pharmacopoeia': 'USP, EP, BP',
                'is_active': True,
            },
            {
                'name': 'Ацетилсалициловая кислота',
                'cas': '50-78-2',
                'description': 'НПВС, антиагрегант. Используется для производства противовоспалительных и антиагрегантных препаратов.',
                'full_description': 'Фармацевтическая субстанция ацетилсалициловой кислоты. Белый кристаллический порошок, чистота ≥ 99.8%. Применяется в производстве таблеток и шипучих форм.',
                'price': Decimal('3800.00'),
                'unit': 'кг',
                'molecular_weight': Decimal('180.16'),
                'storage_conditions': 'Хранить в сухом, защищённом от света месте при температуре 15-25°C',
                'shelf_life': 36,
                'image_key': 'aspirin.svg',
                'video_key': '',
                'manufacturer': 'Bayer AG',
                'country_of_origin': 'Германия',
                'purity': Decimal('99.8'),
                'pharmacopoeia': 'USP, EP',
                'is_active': True,
            },
            {
                'name': 'Ибупрофен',
                'cas': '15687-27-1',
                'description': 'НПВС, анальгетик. Используется для производства обезболивающих и противовоспалительных препаратов.',
                'full_description': 'Фармацевтическая субстанция ибупрофена. Белый кристаллический порошок, чистота ≥ 99.6%. Применяется в производстве таблеток, капсул и суспензий.',
                'price': Decimal('5200.00'),
                'unit': 'кг',
                'molecular_weight': Decimal('206.28'),
                'storage_conditions': 'Хранить в сухом, защищённом от света месте при температуре 15-25°C',
                'shelf_life': 24,
                'image_key': 'ibuprofen.svg',
                'video_key': '',
                'manufacturer': 'BASF SE',
                'country_of_origin': 'Германия',
                'purity': Decimal('99.6'),
                'pharmacopoeia': 'USP, EP, JP',
                'is_active': True,
            },
            {
                'name': 'Амоксициллин',
                'cas': '26787-78-0',
                'description': 'Антибиотик пенициллинового ряда. Используется для производства антибактериальных препаратов.',
                'full_description': 'Фармацевтическая субстанция амоксициллина. Белый или почти белый кристаллический порошок, чистота ≥ 99.0%. Применяется в производстве капсул, таблеток и порошков для суспензий.',
                'price': Decimal('8500.00'),
                'unit': 'кг',
                'molecular_weight': Decimal('365.40'),
                'storage_conditions': 'Хранить в сухом, защищённом от света месте при температуре не выше 25°C',
                'shelf_life': 24,
                'image_key': 'amoxicillin.svg',
                'video_key': '',
                'manufacturer': 'DSM Sinochem Pharmaceuticals',
                'country_of_origin': 'Китай/Нидерланды',
                'purity': Decimal('99.0'),
                'pharmacopoeia': 'USP, EP',
                'is_active': True,
            },
            {
                'name': 'Омепразол',
                'cas': '73590-58-6',
                'description': 'Ингибитор протонной помпы. Используется для производства противоязвенных препаратов.',
                'full_description': 'Фармацевтическая субстанция омепразола. Белый или почти белый порошок, чистота ≥ 99.7%. Применяется в производстве капсул с кишечнорастворимыми гранулами.',
                'price': Decimal('9800.00'),
                'unit': 'кг',
                'molecular_weight': Decimal('345.42'),
                'storage_conditions': 'Хранить в сухом, защищённом от света месте при температуре 15-25°C',
                'shelf_life': 24,
                'image_key': 'omeprazole.svg',
                'video_key': '',
                'manufacturer': 'AstraZeneca',
                'country_of_origin': 'Швеция',
                'purity': Decimal('99.7'),
                'pharmacopoeia': 'USP, EP',
                'is_active': True,
            },
            {
                'name': 'Лозартан калия',
                'cas': '114798-26-4',
                'description': 'Блокатор рецепторов ангиотензина II. Используется для производства антигипертензивных препаратов.',
                'full_description': 'Фармацевтическая субстанция лозартана калия. Белый или почти белый кристаллический порошок, чистота ≥ 99.5%. Применяется в производстве таблеток.',
                'price': Decimal('7200.00'),
                'unit': 'кг',
                'molecular_weight': Decimal('422.91'),
                'storage_conditions': 'Хранить в сухом, защищённом от света месте при температуре 15-25°C',
                'shelf_life': 36,
                'image_key': 'losartan.svg',
                'video_key': '',
                'manufacturer': 'Merck & Co.',
                'country_of_origin': 'США',
                'purity': Decimal('99.5'),
                'pharmacopoeia': 'USP, EP',
                'is_active': True,
            },
            {
                'name': 'Аторвастатин кальция',
                'cas': '134523-00-5',
                'description': 'Гиполипидемическое средство. Используется для производства статинов для снижения холестерина.',
                'full_description': 'Фармацевтическая субстанция аторвастатина кальция. Белый кристаллический порошок, чистота ≥ 99.5%. Применяется в производстве таблеток.',
                'price': Decimal('12500.00'),
                'unit': 'кг',
                'molecular_weight': Decimal('1155.36'),
                'storage_conditions': 'Хранить в сухом, защищённом от света месте при температуре 15-25°C',
                'shelf_life': 36,
                'image_key': 'atorvastatin.svg',
                'video_key': '',
                'manufacturer': 'Pfizer Inc.',
                'country_of_origin': 'США',
                'purity': Decimal('99.5'),
                'pharmacopoeia': 'USP, EP',
                'is_active': True,
            },
            {
                'name': 'Симвастатин',
                'cas': '79902-63-9',
                'description': 'Гиполипидемическое средство. Используется для производства статинов.',
                'full_description': 'Фармацевтическая субстанция симвастатина. Белый кристаллический порошок, чистота ≥ 99.0%. Применяется в производстве таблеток.',
                'price': Decimal('9800.00'),
                'unit': 'кг',
                'molecular_weight': Decimal('418.57'),
                'storage_conditions': 'Хранить в сухом, защищённом от света месте при температуре 15-25°C',
                'shelf_life': 36,
                'image_key': 'simvastatin.svg',
                'video_key': '',
                'manufacturer': 'Merck & Co.',
                'country_of_origin': 'США',
                'purity': Decimal('99.0'),
                'pharmacopoeia': 'USP, EP',
                'is_active': True,
            },
            {
                'name': 'Метформин',
                'cas': '657-24-9',
                'description': 'Гипогликемическое средство. Используется для производства противодиабетических препаратов.',
                'full_description': 'Фармацевтическая субстанция метформина гидрохлорида. Белый кристаллический порошок, чистота ≥ 99.0%. Применяется в производстве таблеток.',
                'price': Decimal('3500.00'),
                'unit': 'кг',
                'molecular_weight': Decimal('165.62'),
                'storage_conditions': 'Хранить в сухом, защищённом от света месте при температуре 15-25°C',
                'shelf_life': 36,
                'image_key': 'metformin.svg',
                'video_key': '',
                'manufacturer': 'Merck Serono',
                'country_of_origin': 'Германия',
                'purity': Decimal('99.0'),
                'pharmacopoeia': 'USP, EP, BP',
                'is_active': True,
            },
            {
                'name': 'Лизиноприл',
                'cas': '83915-83-7',
                'description': 'Ингибитор АПФ. Используется для производства антигипертензивных препаратов.',
                'full_description': 'Фармацевтическая субстанция лизиноприла. Белый кристаллический порошок, чистота ≥ 99.5%. Применяется в производстве таблеток.',
                'price': Decimal('6800.00'),
                'unit': 'кг',
                'molecular_weight': Decimal('405.49'),
                'storage_conditions': 'Хранить в сухом, защищённом от света месте при температуре 15-25°C',
                'shelf_life': 36,
                'image_key': 'lisinopril.svg',
                'video_key': '',
                'manufacturer': 'Merck & Co.',
                'country_of_origin': 'США',
                'purity': Decimal('99.5'),
                'pharmacopoeia': 'USP, EP',
                'is_active': True,
            },
            {
                'name': 'Амлодипин',
                'cas': '88150-42-9',
                'description': 'Блокатор кальциевых каналов. Используется для производства антигипертензивных препаратов.',
                'full_description': 'Фармацевтическая субстанция амлодипина безилата. Белый кристаллический порошок, чистота ≥ 99.0%. Применяется в производстве таблеток.',
                'price': Decimal('5600.00'),
                'unit': 'кг',
                'molecular_weight': Decimal('567.05'),
                'storage_conditions': 'Хранить в сухом, защищённом от света месте при температуре 15-25°C',
                'shelf_life': 36,
                'image_key': 'amlodipine.svg',
                'video_key': '',
                'manufacturer': 'Pfizer Inc.',
                'country_of_origin': 'США',
                'purity': Decimal('99.0'),
                'pharmacopoeia': 'USP, EP',
                'is_active': True,
            },
            {
                'name': 'Клопидогрел',
                'cas': '113665-84-2',
                'description': 'Антиагрегант. Используется для производства препаратов для профилактики тромбозов.',
                'full_description': 'Фармацевтическая субстанция клопидогрела бисульфата. Белый кристаллический порошок, чистота ≥ 99.5%. Применяется в производстве таблеток.',
                'price': Decimal('15800.00'),
                'unit': 'кг',
                'molecular_weight': Decimal('419.90'),
                'storage_conditions': 'Хранить в сухом, защищённом от света месте при температуре 15-25°C',
                'shelf_life': 36,
                'image_key': 'clopidogrel.svg',
                'video_key': '',
                'manufacturer': 'Sanofi',
                'country_of_origin': 'Франция',
                'purity': Decimal('99.5'),
                'pharmacopoeia': 'USP, EP',
                'is_active': True,
            },
            {
                'name': 'Цетиризин',
                'cas': '83881-51-0',
                'description': 'Антигистаминное средство. Используется для производства противоаллергических препаратов.',
                'full_description': 'Фармацевтическая субстанция цетиризина дигидрохлорида. Белый кристаллический порошок, чистота ≥ 99.0%. Применяется в производстве таблеток и сиропов.',
                'price': Decimal('4200.00'),
                'unit': 'кг',
                'molecular_weight': Decimal('461.81'),
                'storage_conditions': 'Хранить в сухом, защищённом от света месте при температуре 15-25°C',
                'shelf_life': 36,
                'image_key': 'cetirizine.png',
                'video_key': '',
                'manufacturer': 'UCB Pharma',
                'country_of_origin': 'Бельгия',
                'purity': Decimal('99.0'),
                'pharmacopoeia': 'USP, EP',
                'is_active': True,
            },
            {
                'name': 'Лоратадин',
                'cas': '79794-75-5',
                'description': 'Антигистаминное средство. Используется для производства противоаллергических препаратов.',
                'full_description': 'Фармацевтическая субстанция лоратадина. Белый кристаллический порошок, чистота ≥ 99.0%. Применяется в производстве таблеток и сиропов.',
                'price': Decimal('4900.00'),
                'unit': 'кг',
                'molecular_weight': Decimal('382.88'),
                'storage_conditions': 'Хранить в сухом, защищённом от света месте при температуре 15-25°C',
                'shelf_life': 36,
                'image_key': 'loratadin.svg',
                'video_key': '',
                'manufacturer': 'Schering-Plough',
                'country_of_origin': 'США',
                'purity': Decimal('99.0'),
                'pharmacopoeia': 'USP, EP',
                'is_active': True,
            },
            {
                'name': 'Сальбутамол',
                'cas': '18559-94-9',
                'description': 'Бронходилататор. Используется для производства препаратов для лечения астмы и ХОБЛ.',
                'full_description': 'Фармацевтическая субстанция сальбутамола сульфата. Белый кристаллический порошок, чистота ≥ 99.5%. Применяется в производстве ингаляторов, таблеток и сиропов.',
                'price': Decimal('11200.00'),
                'unit': 'кг',
                'molecular_weight': Decimal('576.70'),
                'storage_conditions': 'Хранить в сухом, защищённом от света месте при температуре 15-25°C',
                'shelf_life': 36,
                'image_key': 'salbutamol.png',
                'video_key': '',
                'manufacturer': 'GlaxoSmithKline',
                'country_of_origin': 'Великобритания',
                'purity': Decimal('99.5'),
                'pharmacopoeia': 'USP, EP',
                'is_active': True,
            },
            {
                'name': 'Карбамазепин',
                'cas': '298-46-4',
                'description': 'Противосудорожное средство. Используется для производства антиэпилептических препаратов.',
                'full_description': 'Фармацевтическая субстанция карбамазепина. Белый или почти белый кристаллический порошок, чистота ≥ 99.0%. Применяется в производстве таблеток.',
                'price': Decimal('6200.00'),
                'unit': 'кг',
                'molecular_weight': Decimal('236.27'),
                'storage_conditions': 'Хранить в сухом, защищённом от света месте при температуре 15-25°C',
                'shelf_life': 36,
                'image_key': 'carbamazepine.svg',
                'video_key': '',
                'manufacturer': 'Novartis',
                'country_of_origin': 'Швейцария',
                'purity': Decimal('99.0'),
                'pharmacopoeia': 'USP, EP',
                'is_active': True,
            },
        ]
        
        created_count = 0
        for data in substances_data:
            substance, created = Substance.objects.get_or_create(
                cas=data['cas'],
                defaults=data
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created: {substance.name}'))
            else:
                # обновляем существующую запись
                substance.name = data['name']
                substance.description = data['description']
                substance.full_description = data['full_description']
                substance.price = data['price']
                substance.molecular_weight = data['molecular_weight']
                substance.storage_conditions = data['storage_conditions']
                substance.shelf_life = data['shelf_life']
                substance.image_key = data['image_key']
                substance.manufacturer = data.get('manufacturer', '')
                substance.country_of_origin = data.get('country_of_origin', '')
                substance.purity = data.get('purity', Decimal('99.0'))
                substance.pharmacopoeia = data.get('pharmacopoeia', 'USP, EP')
                substance.save()
                self.stdout.write(f'Updated: {substance.name}')
        
        self.stdout.write(self.style.SUCCESS(f'Done! Created {created_count} new substances.'))

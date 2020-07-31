import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from 'react';
import { Image } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import formatValue from '../../utils/formatValue';

import api from '../../services/api';

import {
  Container,
  Header,
  ScrollContainer,
  FoodsContainer,
  Food,
  FoodImageContainer,
  FoodContent,
  FoodTitle,
  FoodDescription,
  FoodPricing,
  AdditionalsContainer,
  Title,
  TotalContainer,
  AdittionalItem,
  AdittionalItemText,
  AdittionalQuantity,
  PriceButtonContainer,
  TotalPrice,
  QuantityContainer,
  FinishOrderButton,
  ButtonText,
  IconContainer,
} from './styles';

interface Params {
  id: number;
}

interface Extra {
  id: number;
  name: string;
  value: number;
  quantity: number;
}

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  category: number;
  image_url: string;
  formattedPrice: string;
  extras: Extra[];
}

const FoodDetails: React.FC = () => {
  const [food, setFood] = useState({} as Food);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [foodQuantity, setFoodQuantity] = useState(1);

  const navigation = useNavigation();
  const route = useRoute();

  const routeParams = route.params as Params;

  useEffect(() => {
    async function loadFood(): Promise<void> {
      // Load a specific food with extras based on routeParams id
      if (routeParams.id) {
        const { id } = routeParams;
        const response = await api.get<Food>(`/foods/${id}`);

        const newExtras = response.data.extras.map((extra: Extra) => ({
          ...extra,
          quantity: 0,
        }));

        setFood({
          ...response.data,
          formattedPrice: formatValue(food.price),
        });
        setExtras(newExtras);
      }
    }

    loadFood();
  }, [routeParams]);

  function handleIncrementExtra(id: number): void {
    // Increment extra quantity
    const FindExtra = extras.map(extra =>
      extra.id === id
        ? {
            ...extra,
            quantity: extra.quantity + 1,
          }
        : extra,
    );

    setExtras(FindExtra);
  }

  function handleDecrementExtra(id: number): void {
    // Decrement extra quantity
    const FindExtra = extras.map(extra =>
      extra.id === id
        ? {
            ...extra,
            quantity: extra.quantity - 1,
          }
        : extra,
    );

    const findLessThanOne = FindExtra.find(extra => extra.quantity < 0);

    if (findLessThanOne) {
      return;
    }
    setExtras(FindExtra);
  }

  function handleIncrementFood(): void {
    // Increment food quantity

    const newFoodQuantity = foodQuantity + 1;
    setFoodQuantity(newFoodQuantity);
  }

  function handleDecrementFood(): void {
    // Decrement food quantity
    if (foodQuantity - 1 < 1) {
      return;
    }

    const newFoodQuantity = foodQuantity - 1;

    setFoodQuantity(newFoodQuantity);
  }

  const toggleFavorite = useCallback(() => {
    // Toggle if food is favorite or not
  }, [isFavorite, food]);

  const cartTotal = useMemo(() => {
    // Calculate cartTotal

    const foodPrice =
      extras.reduce(function (
        accumulator: number,
        currentValue: Extra,
      ): number {
        const price = currentValue.value * currentValue.quantity;
        const aux = accumulator + price;
        return aux;
      },
      0) +
      food.price * foodQuantity;

    return formatValue(foodPrice);
  }, [extras, food, foodQuantity]);

  async function handleFinishOrder(): Promise<void> {
    // Finish the order and save on the API
    const {
      name,
      description,
      price,
      image_url,
      formattedPrice,
      category,
    } = food;
    await api.post('/orders', {
      name,
      description,
      price,
      category,
      thumbnail_url: image_url,
      formattedPrice,
      extras: extras.map(extra => {
        return {
          id: extra.id,
          name: extra.name,
          value: extra.value,
          quantity: extra.quantity,
        };
      }),
    });
  }

  // Calculate the correct icon name
  const favoriteIconName = useMemo(
    () => (isFavorite ? 'favorite' : 'favorite-border'),
    [isFavorite],
  );

  useLayoutEffect(() => {
    // Add the favorite icon on the right of the header bar
    navigation.setOptions({
      headerRight: () => (
        <MaterialIcon
          name={favoriteIconName}
          size={24}
          color="#FFB84D"
          onPress={() => toggleFavorite()}
        />
      ),
    });
  }, [navigation, favoriteIconName, toggleFavorite]);

  return (
    <Container>
      <Header />

      <ScrollContainer>
        <FoodsContainer>
          <Food>
            <FoodImageContainer>
              <Image
                style={{ width: 327, height: 183 }}
                source={{
                  uri: food.image_url,
                }}
              />
            </FoodImageContainer>
            <FoodContent>
              <FoodTitle>{food.name}</FoodTitle>
              <FoodDescription>{food.description}</FoodDescription>
              <FoodPricing>{food.formattedPrice}</FoodPricing>
            </FoodContent>
          </Food>
        </FoodsContainer>
        <AdditionalsContainer>
          <Title>Adicionais</Title>
          {extras.map(extra => (
            <AdittionalItem key={extra.id}>
              <AdittionalItemText>{extra.name}</AdittionalItemText>
              <AdittionalQuantity>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="minus"
                  onPress={() => handleDecrementExtra(extra.id)}
                  testID={`decrement-extra-${extra.id}`}
                />
                <AdittionalItemText testID={`extra-quantity-${extra.id}`}>
                  {extra.quantity}
                </AdittionalItemText>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="plus"
                  onPress={() => handleIncrementExtra(extra.id)}
                  testID={`increment-extra-${extra.id}`}
                />
              </AdittionalQuantity>
            </AdittionalItem>
          ))}
        </AdditionalsContainer>
        <TotalContainer>
          <Title>Total do pedido</Title>
          <PriceButtonContainer>
            <TotalPrice testID="cart-total">{cartTotal}</TotalPrice>
            <QuantityContainer>
              <Icon
                size={15}
                color="#6C6C80"
                name="minus"
                onPress={handleDecrementFood}
                testID="decrement-food"
              />
              <AdittionalItemText testID="food-quantity">
                {foodQuantity}
              </AdittionalItemText>
              <Icon
                size={15}
                color="#6C6C80"
                name="plus"
                onPress={handleIncrementFood}
                testID="increment-food"
              />
            </QuantityContainer>
          </PriceButtonContainer>

          <FinishOrderButton onPress={() => handleFinishOrder()}>
            <ButtonText>Confirmar pedido</ButtonText>
            <IconContainer>
              <Icon name="check-square" size={24} color="#fff" />
            </IconContainer>
          </FinishOrderButton>
        </TotalContainer>
      </ScrollContainer>
    </Container>
  );
};

export default FoodDetails;

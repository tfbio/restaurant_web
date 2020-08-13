import React, { useState, useEffect } from 'react';

import * as Yup from 'yup';
import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      await api.get<IFoodPlate[]>('/foods').then(foodList => {
        const apiResponse = foodList.data;

        setFoods(apiResponse);
      });
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required('Name is required.'),
        price: Yup.number().required('Price is required.'),
        description: Yup.string().required('Description is required.'),
      });

      await schema.validate(food, {
        abortEarly: false,
      });

      const newFood = await api.post<IFoodPlate>('/foods', food);
      newFood.data.available = true;

      setFoods([...foods, newFood.data]);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const schema = Yup.object().shape({
        name: Yup.string(),
        price: Yup.number(),
        description: Yup.string(),
      });

      await schema.validate(food, {
        abortEarly: false,
      });

      const response = await api.put<IFoodPlate>(`/foods/${editingFood.id}`, {
        ...food,
        id: editingFood.id,
        available: true,
      });
      console.log(response);

      setFoods(
        foods.map(foodMap =>
          foodMap.id === editingFood.id ? { ...response.data } : foodMap,
        ),
      );
    } catch (err) {
      console.log(err);
    }
  }

  async function handleDeleteFood(id: number): Promise<void> {
    try {
      await api.delete(`/foods/${id}`).then(() => {
        const removeDeleted = foods.filter(food => food.id !== id);

        setFoods(removeDeleted);
      });
    } catch (err) {
      console.log(err);
    }
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    setEditingFood(food);
    toggleEditModal();
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;

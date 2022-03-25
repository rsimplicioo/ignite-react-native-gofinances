import React, { useState } from "react";
import { 
  Alert, 
  Keyboard, 
  Modal, 
  TouchableNativeFeedback 
} from "react-native";
import * as Yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import AsyncStorage from  '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

import { useForm } from "react-hook-form"; 
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../hooks/auth";

import { Button } from "../../components/Form/Button";
import { InputForm } from "../../components/Form/InputForm";
import { TransactionTypeButton } from "../../components/Form/TransactionTypeButton";
import { CategorySelectButton } from "../../components/Form/CategorySelectButton";

import { CategorySelect } from "../../screens/CategorySelect";

import { 
  Container,
  Header,
  Title, 
  Form,
  Fields,
  TransactionTypes
} from "./styles";

interface FormaData {
  name: string;
  amount: string;
}

const schema = Yup.object().shape({
  name: Yup
  .string()
  .required('Nome é obrigatório'),
  amount: Yup
  .number()
  .typeError('Informe um valor numérico')
  .positive('O valor não pode ser negativo')
  .required('Preço é obrigatório')
})

export function Register(){
  const [transactionType, setTransactionType] = useState('');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const { user } = useAuth();

  const [category, setCategory] = useState({
    key: 'category',
    name: 'Categoria'
  });

  const navigation = useNavigation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  function handleTransactionTypeSelect(type: 'positive' | 'negative'){
    setTransactionType(type);
  }

  function handleCloseSelectCategoryModal() {
    setCategoryModalOpen(false);
  }
  
  function handleOpenSelectCategoryModal() {
    setCategoryModalOpen(true);
  }

  async function handleRegister(form: FormaData){
    if(!transactionType)
      return Alert.alert("Selecione o tipo de transação");

    if(category.key === 'category')
      return Alert.alert("Selecione a categoria");

    const newTransaction = {
      id: String(uuid.v4()),
      name: form.name,
      amount: form.amount,
      type: transactionType,
      category: category.key,
      date: new Date()
    }

    try {
      const dataKey = `@gofinances:transactions_user:${user.id}`;
      
      const data = await AsyncStorage.getItem(dataKey);
      const currentData = data ? JSON.parse(data) : [];

      const dataFormatted = [
        ...currentData,
        newTransaction
      ];

      await AsyncStorage.setItem(dataKey, JSON.stringify(dataFormatted));

      reset();
      setTransactionType('');
      setCategory({
        key: 'categoty',
        name: 'Categoria'
      });

      navigation.navigate('Listagem');

    } catch (error) {
      console.log(error)
      Alert.alert('Não foi possível salvar')
    }
  }

  return(
    <TouchableNativeFeedback onPress={Keyboard.dismiss}>
      <Container>
        <Header>
          <Title>Cadastro</Title>
        </Header>

        <Form>
          <Fields>
            <InputForm
              name="name"
              control={control}
              placeholder="Nome"
              autoCapitalize="sentences"
              autoCorrect={false}
              error={errors.name && errors.name.message}
            />

            <InputForm
              name="amount"
              control={control}
              placeholder="Preço"
              keyboardType="numeric"
              error={errors.amount && errors.amount.message}
            />

            <TransactionTypes>
              <TransactionTypeButton 
                title="Income" 
                type="up"
                onPress={() => handleTransactionTypeSelect('positive')}
                isActive={transactionType === 'positive'}
              />
              <TransactionTypeButton 
                title="Outcome" 
                type="down"
                onPress={() => handleTransactionTypeSelect('negative')}
                isActive={transactionType === 'negative'}
              />
            </TransactionTypes>

            <CategorySelectButton 
              testID="button-category"
              title={category.name} 
              onPress={handleOpenSelectCategoryModal}
            />

          </Fields>

          <Button 
            title="Enviar" 
            onPress={handleSubmit(handleRegister)} 
          />
        </Form>

        <Modal testID="modal-category" visible={categoryModalOpen}>
          <CategorySelect 
            category={category}
            setCategory={setCategory}
            closeSelectCategory={handleCloseSelectCategoryModal}
          />
        </Modal>

      </Container>
    </TouchableNativeFeedback>
  )
}
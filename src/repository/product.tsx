import axios from 'axios';
import { type BookData } from '../model/product';

export const fetchBookData = async (): Promise<BookData> => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/item');
    return response.data;
  } catch (error) {
    throw new Error('Could not fetch data from the API.');
  }
};
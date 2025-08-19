import { useQuery } from '@tanstack/react-query';
import { fetchBookData } from './repository/product';
import { type BookData } from './model/product';

function App() {
  // 1. Use `data` directly. Avoid renaming it to a capitalized type name.
  //    It's also good practice to tell useQuery what type to expect.
  const { data, error, isLoading } = useQuery<BookData>({
    queryKey: ['bookData'], // A unique key for this query
    queryFn: fetchBookData,  // The function that fetches the data
  });

  // 2. Handle the loading state first.
  if (isLoading) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <h1 className='text-3xl'>Loading...</h1>
      </div>
    );
  }

  // 3. Handle the error state.
  if (error) {
    return (
      <div className='h-screen flex items-center justify-center'>
        {/* It's good practice to show the error message for debugging */}
        <h1 className='text-3xl'>An error occurred: {error.message}</h1>
      </div>
    );
  }

  // 4. If we reach this point, we know `isLoading` is false, `error` is null,
  //    and `data` is available and has the type `BookData`.
  if (data != null) {
    return (
      <div className='h-screen flex flex-col items-center justify-center gap-y-0.5'>
        {/* 5. Now we can safely access properties on `data` */}
        <h1 className='text-3xl'>{data.data}</h1>
        <h1 className='text-xl'>Jumlah: {data.jumlah}</h1>
      </div>
    );
  }
}

export default App;
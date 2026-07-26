import { PropsWithChildren } from 'react';
import { useLaunch } from '@tarojs/taro';
import { LucideTaroProvider } from 'lucide-react-taro';
import './app.css';

function App({ children }: PropsWithChildren<unknown>) {
  useLaunch(() => {
    console.log('抖音解析小程序启动');
  });

  return (
    <LucideTaroProvider color="#ffffff">
      {children}
    </LucideTaroProvider>
  );
}

export default App;

import { HashRouter, Route, Routes } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import Layout from './Layout';
import Static from './pages/static/static';
import Fade from './pages/fade/fade';
import Breathing from './pages/breathing/breathing';


const root = createRoot(document.getElementById('app'));
root.render(<HashRouter>
  <Routes>
    <Route path='/' element={<Layout/>}>
      <Route index element={<Static/>} />
      <Route path='breathing' element={<Breathing/>} />
      <Route path='fade' element={<Fade/>} />
    </Route>
  </Routes>
</HashRouter>);
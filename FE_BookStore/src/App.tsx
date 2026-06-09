import { Route, Routes } from 'react-router-dom';
import { PublicPage, PrivatePage } from './router';
import ScrollToTop from './components/OtherComponent/ScrollToTop';
import ProtectedRoute from './components/OtherComponent/ProtectedRoute';

function App() {
  return (
    <div>
      <ScrollToTop />
      <Routes>
        {/* Render Public Pages */}
        {PublicPage.map((page, index) => {
          console.log(page);
          const Page = page.component;
          const Layout = page.layout;

          if (!Layout) {
            return (
              <Route
                key={index}
                path={page.path}
                element={<Page />}
              />
            );
          } else {
            return (
              <Route
                key={index}
                path={page.path}
                element={
                  <Layout>
                    <Page />
                  </Layout>
                }
              />
            );
          }
        })}

        {/* Render Private Admin Pages */}
        {PrivatePage.map((page, index) => {
          const Page = page.component;
          const Layout = page.layout;

          if (!Layout) {
            return (
              <Route
                key={`private-${index}`}
                path={page.path}
                element={
                  <ProtectedRoute requiredRole="ROLE_ADMIN">
                    <Page />
                  </ProtectedRoute>
                }
              />
            );
          } else {
            return (
              <Route
                key={`private-${index}`}
                path={page.path}
                element={
                  <ProtectedRoute requiredRole="ROLE_ADMIN">
                    <Layout>
                      <Page />
                    </Layout>
                  </ProtectedRoute>
                }
              />
            );
          }
        })}
      </Routes>
    </div>
  );
}

export default App;

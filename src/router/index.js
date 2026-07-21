import { createRouter, createWebHashHistory } from 'vue-router';
import { useMainStore } from '../store';
import RecordsTab from '../views/RecordsTab.vue';
import DashboardTab from '../views/DashboardTab.vue';
import RefsTab from '../views/RefsTab.vue';
import UsersTab from '../views/UsersTab.vue';
import OrganizationsTab from '../views/OrganizationsTab.vue';
import TicketsTab from '../views/TicketsTab.vue';
import AuthView from '../views/AuthView.vue';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: AuthView,
  },
  {
    path: '/records',
    name: 'records',
    component: RecordsTab,
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardTab,
    meta: { requiresAuth: true }
  },
  {
    path: '/refs',
    name: 'refs',
    component: RefsTab,
    meta: { requiresAuth: true, roles: ['Superadmin', 'SenMaster'] }
  },
  {
    path: '/users',
    name: 'users',
    component: UsersTab,
    meta: { requiresAuth: true, roles: ['Superadmin', 'SenMaster'] }
  },
  {
    path: '/organizations',
    name: 'organizations',
    component: OrganizationsTab,
    meta: { requiresAuth: true, roles: ['Superadmin'] }
  },
  {
    path: '/tickets',
    name: 'tickets',
    component: TicketsTab,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: () => {
      const userVal = localStorage.getItem("currentUser");
      if (!userVal) return '/login';
      try {
        const user = JSON.parse(userVal);
        if (user.Role === 'Superadmin') {
          return '/dashboard';
        }
        return '/records';
      } catch (e) {
        return '/login';
      }
    }
  }
];

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const store = useMainStore();
  const user = store.user;

  if (to.meta.requiresAuth && !user) {
    next('/login');
  } else if (to.name === 'login' && user) {
    if (user.Role === 'Superadmin') {
      next('/dashboard');
    } else {
      next('/records');
    }
  } else if (to.meta.roles && user && !to.meta.roles.includes(user.Role)) {
    if (user.Role === 'Superadmin') {
      next('/dashboard');
    } else {
      next('/records');
    }
  } else {
    next();
  }
});

export default router;

import { createRouter, createWebHashHistory } from 'vue-router';
import { useMainStore } from '../store';
import { logPageView } from '../services/api';

const AuthView = () => import('../views/AuthView.vue');
const RecordsTab = () => import('../views/RecordsTab.vue');
const DashboardTab = () => import('../views/DashboardTab.vue');
const RefsTab = () => import('../views/RefsTab.vue');
const UsersTab = () => import('../views/UsersTab.vue');
const AllUsersTab = () => import('../views/AllUsersTab.vue');
const PageAnalyticsTab = () => import('../views/PageAnalyticsTab.vue');
const OrganizationsTab = () => import('../views/OrganizationsTab.vue');
const TicketsTab = () => import('../views/TicketsTab.vue');
const AllRecordsTab = () => import('../views/AllRecordsTab.vue');

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
    path: '/all_users',
    name: 'all_users',
    component: AllUsersTab,
    meta: { requiresAuth: true, roles: ['Superadmin'] }
  },
  {
    path: '/page_analytics',
    name: 'page_analytics',
    component: PageAnalyticsTab,
    meta: { requiresAuth: true, roles: ['Superadmin'] }
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
    path: '/all_records',
    name: 'all_records',
    component: AllRecordsTab,
    meta: { requiresAuth: true, roles: ['Superadmin'] }
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

let isAuthInitialized = false;

router.beforeEach(async (to, from, next) => {
  const store = useMainStore();

  if (!isAuthInitialized) {
    if (localStorage.getItem("currentUser")) {
      await store.initAuth();
    }
    isAuthInitialized = true;
  }

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

let lastLoggedPage = null;
router.afterEach((to) => {
  const store = useMainStore();
  if (store.user && to.name && to.name !== 'login' && to.name !== lastLoggedPage) {
    lastLoggedPage = to.name;
    logPageView(to.name, store.user.ID, store.user.OrganizationID);
  }
});

export default router;

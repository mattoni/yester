export const links = {
  login: () => '/login',
  profile: (id: string) => `/profile/${id}`,
}

export const linkto = (link: string) => `#${link}`;
Rails.application.routes.draw do

  get 'auth/:provider/callback', to: 'sessions#create'
  get 'signout', to: 'sessions#destroy', as: 'signout'

  root "welcome#index"

end

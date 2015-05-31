Rails.application.routes.draw do
  devise_for :users
  root 'geo#index'
  get 'geo/index'

    mount Commontator::Engine => '/commontator'
end

class GeoController < ApplicationController
  before_action :authenticate_user!
  def index
    @geoFeatures = GeoFeature.all
  end
end

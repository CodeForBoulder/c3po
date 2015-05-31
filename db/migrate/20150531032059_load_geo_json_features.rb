class LoadGeoJsonFeatures < ActiveRecord::Migration
  def change
    geoFile = open("#{Rails.root}/app/assets/DevelopmentReviewClosed.GeoJSON")
    geoJson = geoFile.read
    geo = JSON.parse(geoJson)

    geo["features"].each do |feature|
      GeoFeature.create( caseNumber: feature["properties"]["CASE_NUMBE"] )
    end
  end
end

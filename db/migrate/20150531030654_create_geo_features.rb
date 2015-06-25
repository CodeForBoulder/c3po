class CreateGeoFeatures < ActiveRecord::Migration
  def change
    create_table :geo_features do |t|
      t.string :caseNumber

      t.timestamps null: false
    end
  end
end

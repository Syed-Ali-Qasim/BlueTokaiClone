import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface FilterSidebarProps {
  filters: {
    roastLevel: string[]
    drinkingPreference: string[]
    flavourProfile: string[]
  }
  selectedFilters: {
    roastLevel: string[]
    drinkingPreference: string[]
    flavourProfile: string[]
  }
  onFilterChange: (type: string, value: string, checked: boolean) => void
}

export default function FilterSidebar({ filters, selectedFilters, onFilterChange }: FilterSidebarProps) {
  const roastLevels = ['Dark', 'Light', 'Medium', 'Medium Dark']
  
  const drinkingPreferences = [
    'With Milk',
    'Without Milk',
    'Medium',
    'Medium Dark'
  ]
  
  const flavourProfiles = [
    'With Milk',
    'Without Milk',
    'Medium',
    'Medium Dark'
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-6 space-y-8">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
          ROAST LEVEL
        </h3>
        <div className="space-y-3">
          {roastLevels.map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <Checkbox
                id={`roast-${level}`}
                checked={selectedFilters.roastLevel.includes(level)}
                onCheckedChange={(checked) => 
                  onFilterChange('roastLevel', level, checked as boolean)
                }
              />
              <Label 
                htmlFor={`roast-${level}`}
                className="text-sm text-gray-700 cursor-pointer"
              >
                {level}
              </Label>
            </div>
          ))}
        </div>
      </div>

<div>
  <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
    DRINKING PREFERENCE
  </h3>
  <div className="space-y-3">
    {drinkingPreferences.map((pref) => (
      <div key={pref} className="flex items-center space-x-2">
        <Checkbox
          id={`drinking-${pref}`}
          checked={selectedFilters.drinkingPreference.includes(pref)}
          onCheckedChange={(checked) => 
            onFilterChange('drinkingPreference', pref, checked as boolean)
          }
        />
        <Label 
          htmlFor={`drinking-${pref}`}
          className="text-sm text-gray-700 cursor-pointer"
        >
          {pref}
        </Label>
      </div>
    ))}
  </div>
</div>


      <div>
        <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
          FLAVOUR PROFILE
        </h3>
        <div className="space-y-3">
          {['Balanced', 'Bold and Bitter', 'Chocolatey and Nutty', 'Delicate and Complex'].map((profile) => (
            <div key={profile} className="flex items-center space-x-2">
              <Checkbox
                id={`flavour-${profile}`}
                checked={selectedFilters.flavourProfile.includes(profile)}
                onCheckedChange={(checked) => 
                  onFilterChange('flavourProfile', profile, checked as boolean)
                }
              />
              <Label 
                htmlFor={`flavour-${profile}`}
                className="text-sm text-gray-700 cursor-pointer"
              >
                {profile}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
---
title: "NEH funding histories for AAU Institutions"
author: "Samuel J. Huskey"
date: "2022-09-26"
layout: base
tags:
  - Python
---

## Introduction

The [first pillar](https://www.ou.edu/leadon/pillars/pillar1) in the [strategic plan](https://www.ou.edu/leadon) of my home institution, the [University of Oklahoma](https://www.ou.edu/) is "Become a Top-Tier Public Research University." Strategy #1 in that pillar is "Meet Association of American Universities-quality benchmarks to position OU among the top public universities in the U.S." OU's [Dodge Family College of Arts and Sciences](https://www.ou.edu/cas/) supports this strategy in its (draft) [strategic plan](https://ou.edu/cas/connect/strategic-plan): "The DFCAS must build, maintain, and continually advance a culture of excellence to ensure we are at the leading edge of OU’s research ambitions and AAU aspirations."

Accordingly, to do my part to support these efforts, I aim to use my background in the humanities and my data skills (such as they are) to shed some light on research metrics in humanities departments at AAU institutions. What follows is my first effort: analyzing the history of research funding from the National Endowment for the Humanities (NEH) to public AAU institutions.

## Sources

I searched the [NEH's database](https://securegrants.neh.gov/publicquery/main.aspx), entering the names of AAU institutions into the "Organization Name" field. I downloaded the results in CSV form, then I used the Python [Pandas](https://pandas.pydata.org/) library to analyze the data.

The data and the Jupyter notebook are available on my GitHub page at [https://github.com/sjhuskey/aau](https://github.com/sjhuskey/aau).

## Exploring the Data

After creating a big dataframe out of the 35 CSV files that I downloaded from the NEH's database, I explored the data.

First, I used the `info()` method to see what was available in the dataframe.

```python
big_frame.info()


    <class 'pandas.core.frame.DataFrame'>
    Int64Index: 9590 entries, 0 to 154
    Data columns (total 45 columns):
     #   Column                         Non-Null Count  Dtype
    ---  ------                         --------------  -----
     0   ApplicationID                  9590 non-null   int64
     1   ApplicationNumber              9590 non-null   object
     2   ApplicantType                  9590 non-null   int64
     3   SuppCount                      9590 non-null   int64
     4   ProductCount                   9590 non-null   int64
     5   CoverageCount                  9590 non-null   int64
     6   PrizeCount                     9590 non-null   int64
     7   ParticipatingInstitutionCount  9590 non-null   int64
     8   WhitePaper                     9590 non-null   int64
     9   WhitePaperPath                 167 non-null    object
     10  PDFirstname                    9590 non-null   object
     11  PDMiddlename                   6406 non-null   object
     12  PDLastname                     9590 non-null   object
     13  PDNameSuffix                   210 non-null    object
     14  CoPDFirstname                  162 non-null    object
     15  CoPDMiddlename                 76 non-null     object
     16  CoPDLastname                   162 non-null    object
     17  CoPDNameSuffix                 3 non-null      object
     18  Participants                   9590 non-null   object
     19  GranteeDisplay                 9590 non-null   object
     20  Institution                    9590 non-null   object
     21  InstCity                       9590 non-null   object
     22  InstState                      9590 non-null   object
     23  InstPostalCode                 9589 non-null   object
     24  InstCountry                    9590 non-null   object
     25  CouncilDate                    9483 non-null   object
     26  YearAwarded                    9590 non-null   int64
     27  ProjectTitle                   9590 non-null   object
     28  PrimaryDiscipline              9569 non-null   object
     29  AllDisciplines                 9144 non-null   object
     30  ProgramID                      9590 non-null   int64
     31  ProgramName                    9590 non-null   object
     32  DivisionID                     9590 non-null   int64
     33  DivisionName                   9590 non-null   object
     34  OfferedOutright                9590 non-null   float64
     35  OfferedMatching                9590 non-null   float64
     36  ApprovedOutright               9590 non-null   float64
     37  ApprovedMatching               9590 non-null   float64
     38  AwardOutright                  9590 non-null   float64
     39  AwardMatching                  9590 non-null   float64
     40  OriginalAmount                 9590 non-null   float64
     41  SupplementAmount               9590 non-null   float64
     42  GrantPeriod                    9590 non-null   object
     43  ProjectDesc                    9590 non-null   object
     44  ToSupport                      0 non-null      float64
    dtypes: float64(9), int64(11), object(25)
    memory usage: 3.4+ MB
```

I used `unique()` to zoom in on the 'Institution' column to see what was there:

```python
big_frame['Institution'].unique()

    array(['University of Wisconsin System',
           'University of Wisconsin Extension',
           'University of Wisconsin Colleges',
           'University of Wisconsin Foundation', 'University of Minnesota',
           'University of Minnesota Press',
           'University of Minnesota, University Gallery',
           'University of Maryland, College Park',
           'President and Fellows of Harvard College', 'MLA',
           'Regents of the University of California, Santa Barbara',
           'Regents of the University of California, San Diego',
           …
           'Indiana University of Pennsylvania',
           'Indiana University Southeast', 'Indiana University at South Bend',
           'Indiana University, Kokomo',
           'Indiana University Alumni Association', 'Indiana University East',
           'Indiana University Press', 'University Of Houston',
           'University of Kansas, Lawrence',
           'University of Kansas Center for Research, Inc.',
           'Kansas Humanities Council', 'University of Washington',
           'University of Washington, Bothell',
           'Regents of the University of California, Irvine'], dtype=object)
```

It's clear that many of the institutions in the data are not AAU institutions, so I took steps to filter the data.

I made a list of just the AAU institutions:

```python
aau_list = ['University of Kansas, Lawrence',
            'Georgia Tech',
            'University of Maryland, College Park',
            'Mizzou',
            'Board of Trustees of the University of Illinois',
            'UCLA; Regents of the University of California, Los Angeles',
            'Penn State',
            'University of Florida',
            'Purdue University',
            'Rutgers, The State University of New Jersey',
            'Michigan State University',
            'University of Wisconsin System',
            'Trustees of Indiana University',
            'Texas A & M University, College Station',
            'Regents of the University of California, Irvine',
            'University of North Carolina at Chapel Hill',
            'University of Virginia',
            'University of Minnesota',
            'University of California, Berkeley',
            'Regents of the University of Colorado, Boulder',
            'University of Texas, Austin',
            'Regents of the University of California, San Diego',
            'University of Washington',
            'Regents of the University of California, Davis',
            'University of Utah',
            'Regents of the University of California, Santa Barbara',
            'SUNY Research Foundation, Stony Brook',
            'Regents of the University of Michigan',
            'Regents of the University of California, Santa Cruz',
            'University of Iowa',
            'SUNY Research Foundation, Buffalo State College',
            'Arizona Board of Regents',
            'Ohio State University',
            'University of Pittsburgh',
            'University of Oregon',
           ]
# How many institutions are in the aau_list? There should be 35.
len(aau_list)
35
```

Then I used `isin()` to filter the dataframe to include only the institutions in my list of public AAU institutions.

```python
aau_frame = big_frame[big_frame['Institution'].isin(aau_list)]
```

I surveyed the columns in the dataframe to see how I might further filter it.

```python
aau_frame.columns

Index(['ApplicationID', 'ApplicationNumber', 'ApplicantType', 'SuppCount',
           'ProductCount', 'CoverageCount', 'PrizeCount',
           'ParticipatingInstitutionCount', 'WhitePaper', 'WhitePaperPath',
           'PDFirstname', 'PDMiddlename', 'PDLastname', 'PDNameSuffix',
           'CoPDFirstname', 'CoPDMiddlename', 'CoPDLastname', 'CoPDNameSuffix',
           'Participants', 'GranteeDisplay', 'Institution', 'InstCity',
           'InstState', 'InstPostalCode', 'InstCountry', 'CouncilDate',
           'YearAwarded', 'ProjectTitle', 'PrimaryDiscipline', 'AllDisciplines',
           'ProgramID', 'ProgramName', 'DivisionID', 'DivisionName',
           'OfferedOutright', 'OfferedMatching', 'ApprovedOutright',
           'ApprovedMatching', 'AwardOutright', 'AwardMatching', 'OriginalAmount',
           'SupplementAmount', 'GrantPeriod', 'ProjectDesc', 'ToSupport'],
          dtype='object')
```

We'll probably want at least Institution, YearAwarded, ProjectTitle, PrimaryDiscipline, ProgramName, DivisionName, and AwardOutright, so I made a frame with those columns.

```python
data = aau_frame[['Institution','ProjectTitle','PrimaryDiscipline','ProgramName','DivisionName','AwardOutright','YearAwarded']]
```

<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }

</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>Institution</th>
      <th>ProjectTitle</th>
      <th>PrimaryDiscipline</th>
      <th>ProgramName</th>
      <th>DivisionName</th>
      <th>AwardOutright</th>
      <th>YearAwarded</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>University of Wisconsin System</td>
      <td>Accessing the History of Health, Pharmacy, and...</td>
      <td>History, General</td>
      <td>Humanities Collections and Reference Resources</td>
      <td>Preservation and Access</td>
      <td>326326.0</td>
      <td>2022</td>
    </tr>
    <tr>
      <th>1</th>
      <td>University of Wisconsin System</td>
      <td>"Alternative Modernities" and the Modernizatio...</td>
      <td>Theater History and Criticism</td>
      <td>Fellowships</td>
      <td>Research Programs</td>
      <td>60000.0</td>
      <td>2020</td>
    </tr>
    <tr>
      <th>2</th>
      <td>University of Wisconsin System</td>
      <td>The Ford Foundation, Social Science, and the P...</td>
      <td>Latin American History</td>
      <td>Fellowships</td>
      <td>Research Programs</td>
      <td>60000.0</td>
      <td>2020</td>
    </tr>
    <tr>
      <th>3</th>
      <td>University of Wisconsin System</td>
      <td>The History of Cartography Project</td>
      <td>Interdisciplinary Studies, General</td>
      <td>Humanities Collections and Reference Resources</td>
      <td>Preservation and Access</td>
      <td>185000.0</td>
      <td>2021</td>
    </tr>
    <tr>
      <th>4</th>
      <td>University of Wisconsin System</td>
      <td>Open Access Edition of "Citizen Countess: Sofi...</td>
      <td>Russian History</td>
      <td>Fellowships Open Book Program</td>
      <td>Digital Humanities</td>
      <td>5500.0</td>
      <td>2020</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>150</th>
      <td>Mizzou</td>
      <td>Utopian Societies Founded in the Soviet Union ...</td>
      <td>History, General</td>
      <td>Summer Stipends</td>
      <td>Research Programs</td>
      <td>1500.0</td>
      <td>1970</td>
    </tr>
    <tr>
      <th>151</th>
      <td>Mizzou</td>
      <td>The Process of Government During the Presidenc...</td>
      <td>History, General</td>
      <td>Fellowships for University Teachers</td>
      <td>Research Programs</td>
      <td>15500.0</td>
      <td>1970</td>
    </tr>
    <tr>
      <th>152</th>
      <td>Mizzou</td>
      <td>Dr. Johnson and the New Philosophy</td>
      <td>Philosophy, General</td>
      <td>Summer Stipends</td>
      <td>Research Programs</td>
      <td>1500.0</td>
      <td>1970</td>
    </tr>
    <tr>
      <th>153</th>
      <td>Mizzou</td>
      <td>Title not available</td>
      <td>History, General</td>
      <td>Fellowships for Younger Scholars</td>
      <td>Fellowships and Seminars</td>
      <td>8387.0</td>
      <td>1967</td>
    </tr>
    <tr>
      <th>154</th>
      <td>Mizzou</td>
      <td>Title not available</td>
      <td>Philosophy, General</td>
      <td>Summer Stipends</td>
      <td>Research Programs</td>
      <td>1500.0</td>
      <td>1967</td>
    </tr>
  </tbody>
</table>
<p>8929 rows × 7 columns</p>
</div>

Since the NEH has numerous funding programs, it's important to include only those having to do with research. I took a closer look at the ProgramName column:

```python
data['ProgramName'].unique().tolist()

    ['Humanities Collections and Reference Resources',
     'Fellowships',
     'Fellowships Open Book Program',
     'Summer Stipends',
     'Scholarly Editions and Translations',
     'Preservation Assistance Grants',
     'Humanities Connections',
     'Digital Humanities Advancement Grants',
     'Fellowships for University Teachers',
     'Challenge Grants',
     'Fellowships for Advanced Social Science Research on Japan',
     'Research and Development',
     'Documenting Endangered Languages - Preservation',
     'Reference Materials',
     'Preservation/Access Projects',
     'Humanities Projects in Media',
     'Collaborative Research',
     'Education Development and Demonstration',
     'Institutes for Higher Education Faculty',
     'Regional Center Implementation Grants',
     'Institutes for K-12 Educators',
     'Humanities Projects in Libraries and Archives',
     'Regional Center Planning Grants',
     'Basic Research',
     'Seminars for K-12 Educators',
     'Seminars for Higher Education Faculty',
     'Humanities Projects in Museums and Historical Organizations',
     'Editions',
     'Reference Materials - Tools',
     'Study Grants for College Teachers',
     'Translations',
     'Scholarly Publications',
     'Reference Materials - Guides',
     'Humanities, Science, and Technology',
     'Archaeology Projects',
     'Travel to Collections, 11/85 - 2/95',
     'Preservation and Access Projects Pre-1996',
     'Conferences',
     'Younger Scholars, 2/86 - 2/95',
     'Education Development & Demonstration (OLD)',
     'Travel to Collections, 11/83 - 5/85',
     'Humanities Projects for Youth',
     'Reference Materials - Access',
     'State and Local and  Regional Studies',
     'Fellowships for College Teachers and Independent Scholars',
     'Fellowships and Stipends for Professionals',
     'Residential College Teacher Fellowships, 1976-1981',
     'Younger Scholars, 2/76 - 2/85',
     'Institutional Development',
     'Special Projects',
     'State Humanities Councils General Operating Support Grants',
     'Program Development/Planning Grants',
     'Special Fellowships Programs',
     'Bicentennial Histories',
     'Institutional Planning and Development',
     'Institutes for Advanced Topics in the Digital Humanities',
     'Public Scholars',
     'Sustaining Cultural Heritage Collections',
     'Enduring Questions: Pilot Course Grants',
     'Humanities in the Public Square',
     'Digital Humanities Implementation Grants',
     'Digging into Data',
     'Small Grants to Libraries: King James Bible',
     'Bridging Cultures Forums and Workshops',
     "Interpreting America's Historic Places: Planning Grants",
     'Dynamic Language Infrastructure-Documenting Endangered Languages - Fellowships',
     'Special Opportunity in Foreign Language Education',
     'Dissertation Grants',
     'Humanities Programs for Nontraditional Learners',
     'Pilot Grants - Education',
     'Research Challenge Grants',
     'Education Consultant Grants',
     'Cooperative Agreements and Special Projects (Public Programs)',
     'Common Heritage',
     'Dialogues on the Experience of War',
     'NEH/DFG Bilateral Digital Humanities Program',
     'Digital Humanities Start-Up Grants',
     'National Digital Newspaper Program',
     'Cooperative Agreements and Special Projects (Digital Humanities)',
     'Stabilization Grants',
     'Teaching and Learning Resources and Curriculum Development',
     'Faculty Humanities Workshops',
     'Residential College Teacher Fellowships, 1980',
     'Education Challenge Grants',
     'Fellowships for Younger Scholars',
     'Humanities Initiatives at Colleges and Universities',
     'Next Generation Humanities PhD (Planning)',
     'Digital Projects for the Public: Discovery Grants',
     "Small Grants to Libraries: America's Music",
     'Digital Humanities Fellowships',
     'Challenge Grants for Universities',
     'Humanities Institutes Program',
     'NEH on the Road',
     'International Research',
     'Planning and Assessment Studies',
     'Public Programs Special Projects (GD)',
     'Humanities Connections Planning Grants',
     'ARP-Organizations (Preservation-related)',
     'Exhibitions: Implementation',
     "America's Historical and Cultural Organizations: Planning Grants",
     "Save America's Treasures",
     'Preservation and Access Education and Training',
     'Digital Humanities Workshops',
     'Preservation - Assistance Grants (ER Title Ib)',
     'Consultation Grants (ER Title Ib)',
     'National Heritage Preservation Projects',
     'ARP-Organizations (Research-related)',
     'Small Grants to Libraries: Lincoln, Constitution and Civil War',
     'Grants to Preserve and Create Access to Humanities Collections',
     'Challenge Grants for Museums',
     'NEH/AHRC New Directions for Digital Scholarship in Cultural Institutions',
     'Humanities Open Book Program',
     'Humanities Access Grants',
     "Interpreting America's Historic Places Consultation",
     'Landmarks of American History and Culture',
     'Small Grants to Libraries: Pride and Passion',
     'Special Initiatives',
     'Libraries Implementation',
     'Humanities Connections Implementation Grants',
     'Bridging Cultures at Community Colleges',
     'Iraqi Cultural Heritage Initiative',
     'Small Grants to Libraries: Louisa May Alcott',
     'Media Challenge Grants',
     'Short Documentaries',
     'Awards for Faculty',
     'Small Grants to Libraries: John Adams Unbound',
     'Conferences and Congresses',
     'Archaeological and Ethnographic Field Research',
     'Exhibitions: Planning',
     'Advancing Knowledge: The IMLS/NEH Digital Partnership',
     'Infrastructure and Capacity Building Challenge Grants',
     'Enterprise Awards Pre-2001',
     'ARP-Organizations (Public-related)',
     "America's Historical and Cultural Organizations: Implementation Grants",
     'Bicentennial Projects',
     'Media Projects Production',
     'Digital Projects for the Public: Production Grants',
     "America's Media Makers: Production Grants",
     'NEH/DOE Humanities High Performance Computing Program',
     'Fellowships at Digital Humanities Centers',
     'NEH/DFG Symposia and Workshops Program',
     'Distinguished Teaching Professorships (Challenge)',
     'Museums Implementation',
     'History Project',
     'NEH Teacher-Scholar Program',
     'ARP-Organizations (Digital humanities-related)',
     'Cooperative Agreements and Special Projects (P&A)',
     'Cooperative Agreements and Special Projects (Research)',
     'Humanities Initiatives at Hispanic-Serving Institutions',
     'Cooperative Agreements and Special Projects (Education)',
     'ARP-Organizations (Education-related)',
     'Faculty Research Awards',
     'Fostering Coherence Through Instruction',
     'Picturing America',
     'Special Project Challenge Grants',
     'Improving Introductory Courses',
     'Picturing America School Collaboration Projects',
     'Museums Planning',
     'Public Challenge Grants']
```

Many of those awards don't look relevant to AAU considerations. It's possible that the DivisionName column will give us a better picture:

```python
data['DivisionName'].unique().tolist()

    ['Preservation and Access',
     'Research Programs',
     'Digital Humanities',
     'Education Programs',
     'Challenge Programs',
     'Public Programs',
     'Agency-wide Projects',
     'Fellowships and Seminars',
     'Federal/State Partnership']
```

Using `value_counts() will show us how many awards have been given by those divisions.

```python
# Let's get counts of the grants from those programs.
data['DivisionName'].value_counts()


    Research Programs            5287
    Education Programs           1360
    Preservation and Access       852
    Fellowships and Seminars      701
    Public Programs               427
    Digital Humanities            173
    Challenge Programs             84
    Agency-wide Projects           33
    Federal/State Partnership      12
    Name: DivisionName, dtype: int64
```

Let's see that as a bar graph:

```python
data['DivisionName'].value_counts().plot.barh()
```

![png](/assets/images/aau/output_20_1.png)

It would be helpful to have a dataframe with grants from Research Programs, Digital Humanities and Fellowship and Seminars.

```python
programs = ['Research Programs', 'Digital Humanities','Fellowships and Seminars']
aau_research = data[data['DivisionName'].isin(programs)]
```

Let's see how many awards each institution has received over the history of NEH's funding:

```python
# Use value_counts() to get the number of awards per institution.
total_number = aau_research['Institution'].value_counts()
total_number


    Regents of the University of Michigan                         422
    University of California, Berkeley                            413
    Trustees of Indiana University                                361
    University of Virginia                                        336
    UCLA; Regents of the University of California, Los Angeles    315
    University of Texas, Austin                                   279
    Board of Trustees of the University of Illinois               255
    University of Wisconsin System                                252
    University of Maryland, College Park                          230
    University of North Carolina at Chapel Hill                   214
    Rutgers, The State University of New Jersey                   199
    University of Minnesota                                       194
    University of Washington                                      178
    Regents of the University of California, Santa Barbara        176
    University of Iowa                                            163
    Ohio State University                                         146
    University of Kansas, Lawrence                                144
    Penn State                                                    142
    Regents of the University of California, Santa Cruz           135
    Arizona Board of Regents                                      132
    University of Oregon                                          132
    Regents of the University of California, Davis                130
    Regents of the University of Colorado, Boulder                126
    Regents of the University of California, San Diego            119
    University of Florida                                         118
    Mizzou                                                        115
    University of Pittsburgh                                      111
    Michigan State University                                     106
    SUNY Research Foundation, Stony Brook                         102
    Regents of the University of California, Irvine               102
    SUNY Research Foundation, Buffalo State College                82
    Texas A & M University, College Station                        76
    Purdue University                                              72
    University of Utah                                             54
    Georgia Tech                                                   30
    Name: Institution, dtype: int64
```

Here's the same information as a bar graph.

![png](/assets/images/aau/output_23_1.png)

How about the total amount the institutions have received?

```python
# How about total amount?
total_amount = aau_research.groupby('Institution')['AwardOutright'].sum().sort_values().plot.barh(figsize=(10,10))
```

![png](/assets/images/aau/output_24_0.png)

I used `value_counts()` and `nlargest()` to get the top ten institution by number of grants received.

```python
# Use nlargest() to get the top ten institutions by number of grants received.
top_ten = aau_research['Institution'].value_counts().nlargest(10).to_frame()
```

![png](/assets/images/aau/output_27_1.png)

I wanted to make sure that the institutions had equivalent funding histories, so I checked on the earliest and most recent dates of awards for each one.

```python
# Make dataframes of the earliest and most recent years per institution.
maximum = aau_research.groupby(['Institution'])['YearAwarded'].max().reset_index()
minimum = aau_research.groupby(['Institution'])['YearAwarded'].min().reset_index()

# Merge the minimum and maximum frames.
merged = pd.merge(minimum,maximum, on='Institution').rename(columns={'YearAwarded_x':'Earliest','YearAwarded_y':'Latest'})
merged
```

<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }

</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>Institution</th>
      <th>Earliest</th>
      <th>Latest</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>Arizona Board of Regents</td>
      <td>1967</td>
      <td>2021</td>
    </tr>
    <tr>
      <th>1</th>
      <td>Board of Trustees of the University of Illinois</td>
      <td>1967</td>
      <td>2022</td>
    </tr>
    <tr>
      <th>2</th>
      <td>Georgia Tech</td>
      <td>1970</td>
      <td>2017</td>
    </tr>
    <tr>
      <th>3</th>
      <td>Michigan State University</td>
      <td>1967</td>
      <td>2021</td>
    </tr>
    <tr>
      <th>4</th>
      <td>Mizzou</td>
      <td>1967</td>
      <td>2021</td>
    </tr>
    <tr>
      <th>5</th>
      <td>Ohio State University</td>
      <td>1967</td>
      <td>2021</td>
    </tr>
    <tr>
      <th>6</th>
      <td>Penn State</td>
      <td>1967</td>
      <td>2021</td>
    </tr>
    <tr>
      <th>7</th>
      <td>Purdue University</td>
      <td>1967</td>
      <td>2021</td>
    </tr>
    <tr>
      <th>8</th>
      <td>Regents of the University of California, Davis</td>
      <td>1967</td>
      <td>2021</td>
    </tr>
    <tr>
      <th>9</th>
      <td>Regents of the University of California, Irvine</td>
      <td>1967</td>
      <td>2021</td>
    </tr>
    <tr>
      <th>10</th>
      <td>Regents of the University of California, San D...</td>
      <td>1967</td>
      <td>2020</td>
    </tr>
    <tr>
      <th>11</th>
      <td>Regents of the University of California, Santa...</td>
      <td>1967</td>
      <td>2021</td>
    </tr>
    <tr>
      <th>12</th>
      <td>Regents of the University of California, Santa...</td>
      <td>1967</td>
      <td>2020</td>
    </tr>
    <tr>
      <th>13</th>
      <td>Regents of the University of Colorado, Boulder</td>
      <td>1967</td>
      <td>2022</td>
    </tr>
    <tr>
      <th>14</th>
      <td>Regents of the University of Michigan</td>
      <td>1967</td>
      <td>2022</td>
    </tr>
    <tr>
      <th>15</th>
      <td>Rutgers, The State University of New Jersey</td>
      <td>1967</td>
      <td>2021</td>
    </tr>
    <tr>
      <th>16</th>
      <td>SUNY Research Foundation, Buffalo State College</td>
      <td>1966</td>
      <td>2015</td>
    </tr>
    <tr>
      <th>17</th>
      <td>SUNY Research Foundation, Stony Brook</td>
      <td>1967</td>
      <td>2016</td>
    </tr>
    <tr>
      <th>18</th>
      <td>Texas A &amp; M University, College Station</td>
      <td>1971</td>
      <td>2021</td>
    </tr>
    <tr>
      <th>19</th>
      <td>Trustees of Indiana University</td>
      <td>1967</td>
      <td>2021</td>
    </tr>
    <tr>
      <th>20</th>
      <td>UCLA; Regents of the University of California,...</td>
      <td>1967</td>
      <td>2021</td>
    </tr>
    <tr>
      <th>21</th>
      <td>University of California, Berkeley</td>
      <td>1967</td>
      <td>2022</td>
    </tr>
    <tr>
      <th>22</th>
      <td>University of Florida</td>
      <td>1967</td>
      <td>2021</td>
    </tr>
    <tr>
      <th>23</th>
      <td>University of Iowa</td>
      <td>1967</td>
      <td>2022</td>
    </tr>
    <tr>
      <th>24</th>
      <td>University of Kansas, Lawrence</td>
      <td>1967</td>
      <td>2022</td>
    </tr>
    <tr>
      <th>25</th>
      <td>University of Maryland, College Park</td>
      <td>1967</td>
      <td>2021</td>
    </tr>
    <tr>
      <th>26</th>
      <td>University of Minnesota</td>
      <td>1967</td>
      <td>2022</td>
    </tr>
    <tr>
      <th>27</th>
      <td>University of North Carolina at Chapel Hill</td>
      <td>1967</td>
      <td>2021</td>
    </tr>
    <tr>
      <th>28</th>
      <td>University of Oregon</td>
      <td>1970</td>
      <td>2022</td>
    </tr>
    <tr>
      <th>29</th>
      <td>University of Pittsburgh</td>
      <td>1967</td>
      <td>2022</td>
    </tr>
    <tr>
      <th>30</th>
      <td>University of Texas, Austin</td>
      <td>1967</td>
      <td>2022</td>
    </tr>
    <tr>
      <th>31</th>
      <td>University of Utah</td>
      <td>1967</td>
      <td>2022</td>
    </tr>
    <tr>
      <th>32</th>
      <td>University of Virginia</td>
      <td>1967</td>
      <td>2021</td>
    </tr>
    <tr>
      <th>33</th>
      <td>University of Washington</td>
      <td>1967</td>
      <td>2022</td>
    </tr>
    <tr>
      <th>34</th>
      <td>University of Wisconsin System</td>
      <td>1967</td>
      <td>2021</td>
    </tr>
  </tbody>
</table>
</div>

There's some variation in there, but not much.

Next, I wanted to know more about the disciplines represented in the dataset.

```python
# How many disciplines are represented in this dataset?
aau_research['PrimaryDiscipline'].nunique()
150
```

```python
# What are the top twenty disciplines in number of grants?
aau_research['PrimaryDiscipline'].value_counts().nlargest(20).to_frame().reset_index()
```

<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }

</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>index</th>
      <th>PrimaryDiscipline</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>U.S. History</td>
      <td>481</td>
    </tr>
    <tr>
      <th>1</th>
      <td>Interdisciplinary Studies, General</td>
      <td>370</td>
    </tr>
    <tr>
      <th>2</th>
      <td>History, General</td>
      <td>274</td>
    </tr>
    <tr>
      <th>3</th>
      <td>British Literature</td>
      <td>255</td>
    </tr>
    <tr>
      <th>4</th>
      <td>European History</td>
      <td>235</td>
    </tr>
    <tr>
      <th>5</th>
      <td>Art History and Criticism</td>
      <td>217</td>
    </tr>
    <tr>
      <th>6</th>
      <td>Music History and Criticism</td>
      <td>215</td>
    </tr>
    <tr>
      <th>7</th>
      <td>American Literature</td>
      <td>210</td>
    </tr>
    <tr>
      <th>8</th>
      <td>Archaeology</td>
      <td>210</td>
    </tr>
    <tr>
      <th>9</th>
      <td>Literature, General</td>
      <td>205</td>
    </tr>
    <tr>
      <th>10</th>
      <td>Anthropology</td>
      <td>157</td>
    </tr>
    <tr>
      <th>11</th>
      <td>Philosophy, General</td>
      <td>156</td>
    </tr>
    <tr>
      <th>12</th>
      <td>Linguistics</td>
      <td>138</td>
    </tr>
    <tr>
      <th>13</th>
      <td>History and Philosophy of Science, Technology,...</td>
      <td>114</td>
    </tr>
    <tr>
      <th>14</th>
      <td>East Asian History</td>
      <td>111</td>
    </tr>
    <tr>
      <th>15</th>
      <td>Latin American History</td>
      <td>100</td>
    </tr>
    <tr>
      <th>16</th>
      <td>Comparative Literature</td>
      <td>98</td>
    </tr>
    <tr>
      <th>17</th>
      <td>Medieval Studies</td>
      <td>96</td>
    </tr>
    <tr>
      <th>18</th>
      <td>British History</td>
      <td>87</td>
    </tr>
    <tr>
      <th>19</th>
      <td>French Literature</td>
      <td>83</td>
    </tr>
  </tbody>
</table>
</div>

Here's that information as a pie chart:

![png](/assets/images/aau/output_33_1.png)

## Looking at OU

Now that I had some data on the NEH funding history of AAU institutions, it was time to start looking at OU. First, I repeated the steps that I took above: downloading the data, narrowing it down to just OU ('Board of Regents of the University of Oklahoma'), and further narrowing it down to just the NEH awards having to do with research.

Here, I used `groupby()` and `sum()` to get a picture of OU's funding history over time:

```python
# Show the history of NEH funding at OU
ou_years = ou_research.groupby('YearAwarded')['AwardOutright'].sum().to_frame()
ou_years
```

<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }

</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>AwardOutright</th>
    </tr>
    <tr>
      <th>YearAwarded</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>1967</th>
      <td>25407.0</td>
    </tr>
    <tr>
      <th>1970</th>
      <td>9000.0</td>
    </tr>
    <tr>
      <th>1972</th>
      <td>34750.0</td>
    </tr>
    <tr>
      <th>1973</th>
      <td>68795.0</td>
    </tr>
    <tr>
      <th>1974</th>
      <td>4000.0</td>
    </tr>
    <tr>
      <th>1975</th>
      <td>2000.0</td>
    </tr>
    <tr>
      <th>1977</th>
      <td>30000.0</td>
    </tr>
    <tr>
      <th>1978</th>
      <td>101770.0</td>
    </tr>
    <tr>
      <th>1979</th>
      <td>102065.0</td>
    </tr>
    <tr>
      <th>1980</th>
      <td>2500.0</td>
    </tr>
    <tr>
      <th>1981</th>
      <td>4500.0</td>
    </tr>
    <tr>
      <th>1983</th>
      <td>15900.0</td>
    </tr>
    <tr>
      <th>1984</th>
      <td>88652.0</td>
    </tr>
    <tr>
      <th>1985</th>
      <td>58990.0</td>
    </tr>
    <tr>
      <th>1986</th>
      <td>29750.0</td>
    </tr>
    <tr>
      <th>1987</th>
      <td>7000.0</td>
    </tr>
    <tr>
      <th>1988</th>
      <td>10750.0</td>
    </tr>
    <tr>
      <th>1989</th>
      <td>30500.0</td>
    </tr>
    <tr>
      <th>1990</th>
      <td>2950.0</td>
    </tr>
    <tr>
      <th>1996</th>
      <td>30000.0</td>
    </tr>
    <tr>
      <th>1997</th>
      <td>34000.0</td>
    </tr>
    <tr>
      <th>1998</th>
      <td>34000.0</td>
    </tr>
    <tr>
      <th>1999</th>
      <td>34000.0</td>
    </tr>
    <tr>
      <th>2000</th>
      <td>50000.0</td>
    </tr>
    <tr>
      <th>2001</th>
      <td>4500.0</td>
    </tr>
    <tr>
      <th>2002</th>
      <td>85000.0</td>
    </tr>
    <tr>
      <th>2003</th>
      <td>24000.0</td>
    </tr>
    <tr>
      <th>2004</th>
      <td>24000.0</td>
    </tr>
    <tr>
      <th>2005</th>
      <td>40000.0</td>
    </tr>
    <tr>
      <th>2008</th>
      <td>6000.0</td>
    </tr>
    <tr>
      <th>2009</th>
      <td>50400.0</td>
    </tr>
    <tr>
      <th>2013</th>
      <td>50400.0</td>
    </tr>
    <tr>
      <th>2014</th>
      <td>12000.0</td>
    </tr>
    <tr>
      <th>2015</th>
      <td>100800.0</td>
    </tr>
    <tr>
      <th>2016</th>
      <td>6000.0</td>
    </tr>
    <tr>
      <th>2017</th>
      <td>50400.0</td>
    </tr>
    <tr>
      <th>2019</th>
      <td>6000.0</td>
    </tr>
    <tr>
      <th>2022</th>
      <td>6000.0</td>
    </tr>
  </tbody>
</table>
</div>

Here's a dataframe with the most relevant information:

```python
# Here's a dataframe with just the pertinent information about OU.
ou_neh = ou[['Institution','YearAwarded','PDLastname','PDFirstname','ProjectTitle','AwardOutright','PrimaryDiscipline']]
ou_neh
```

<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }

</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>Institution</th>
      <th>YearAwarded</th>
      <th>PDLastname</th>
      <th>PDFirstname</th>
      <th>ProjectTitle</th>
      <th>AwardOutright</th>
      <th>PrimaryDiscipline</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>3</th>
      <td>Board of Regents of the University of Oklahoma</td>
      <td>2021</td>
      <td>Marshall</td>
      <td>Kimberly</td>
      <td>New Stories of the West, for the West</td>
      <td>500000.0</td>
      <td>U.S. History</td>
    </tr>
    <tr>
      <th>7</th>
      <td>Board of Regents of the University of Oklahoma</td>
      <td>2022</td>
      <td>Heaton</td>
      <td>Raina</td>
      <td>Creating Online Access for the Native American...</td>
      <td>345494.0</td>
      <td>Linguistic Anthropology</td>
    </tr>
    <tr>
      <th>8</th>
      <td>Board of Regents of the University of Oklahoma</td>
      <td>2022</td>
      <td>Mansky</td>
      <td>Joseph</td>
      <td>Plays, Libels, and the Public Sphere in Shakes...</td>
      <td>6000.0</td>
      <td>British Literature</td>
    </tr>
    <tr>
      <th>15</th>
      <td>Board of Regents of the University of Oklahoma</td>
      <td>2020</td>
      <td>Heaton</td>
      <td>Raina</td>
      <td>Collaboration and development for digital acce...</td>
      <td>49495.0</td>
      <td>Native American Studies</td>
    </tr>
    <tr>
      <th>27</th>
      <td>Board of Regents of the University of Oklahoma</td>
      <td>2019</td>
      <td>Marshall</td>
      <td>Kimberly</td>
      <td>Re-Membering the Boise Valley People: Rethinki...</td>
      <td>6000.0</td>
      <td>Cultural Anthropology</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>460</th>
      <td>Board of Regents of the University of Oklahoma</td>
      <td>1970</td>
      <td>Davis</td>
      <td>Robert</td>
      <td>Title not available</td>
      <td>1500.0</td>
      <td>English</td>
    </tr>
    <tr>
      <th>463</th>
      <td>Board of Regents of the University of Oklahoma</td>
      <td>1970</td>
      <td>Calhoun</td>
      <td>Dougald</td>
      <td>Correspondence of French Revolutionary Deputie...</td>
      <td>7500.0</td>
      <td>History, General</td>
    </tr>
    <tr>
      <th>468</th>
      <td>Board of Regents of the University of Oklahoma</td>
      <td>1967</td>
      <td>Opler</td>
      <td>Morris</td>
      <td>Title not available</td>
      <td>15520.0</td>
      <td>Anthropology</td>
    </tr>
    <tr>
      <th>471</th>
      <td>Board of Regents of the University of Oklahoma</td>
      <td>1967</td>
      <td>Davis</td>
      <td>Gwenn</td>
      <td>Title not available</td>
      <td>1500.0</td>
      <td>English</td>
    </tr>
    <tr>
      <th>472</th>
      <td>Board of Regents of the University of Oklahoma</td>
      <td>1967</td>
      <td>Miller</td>
      <td>David</td>
      <td>Title not available</td>
      <td>8387.0</td>
      <td>Hispanic American Studies</td>
    </tr>
  </tbody>
</table>
<p>114 rows × 7 columns</p>
</div>

Which disciplines at OU have been the most successful at getting NEH grants?

```python
ou_neh['PrimaryDiscipline'].value_counts().nlargest(10).plot.pie(label='',figsize=(10,20),fontsize=14)
```

![png](/assets/images/aau/output_62_1.png)

## Comparing OU to AAU institutions

For a very basic overview, I compared OU's NEH funding per year to each AAU institution's NEH funding per year.

```python
'''
Make a frame of OU's NEH funding history to compare to AAU institutions.
'''
OU = ou_neh.groupby('YearAwarded')['AwardOutright'].sum().to_frame()
```

Getting individual AAU institutions was tricky for me. I'm sure there are much better ways of doing this, but I settled on this method.

First, I made a Python dictionary of AAU institutions, with the AAU name as key and the name as it appears in the NEH data as the value. I used that to make individual dataframes to compare with OU.

```python
aau_dict = {'University of Kansas':'University of Kansas, Lawrence',
            'Georgia Tech':'Georgia Tech',
            'University of Maryland':'University of Maryland, College Park',
            'University of Missouri':'Mizzou',
            'University of Illinois':'Board of Trustees of the University of Illinois',
            'UCLA':'UCLA; Regents of the University of California, Los Angeles',
            'Penn State':'Penn State',
            'University of Florida':'University of Florida',
            'Purdue':'Purdue University',
            'Rutgers':'Rutgers, The State University of New Jersey',
            'Michigan State University':'Michigan State University',
            'University of Wisconsin':'University of Wisconsin System',
            'Indiana University':'Trustees of Indiana University',
            'Texas A & M':'Texas A & M University, College Station',
            'UC Irvine':'Regents of the University of California, Irvine',
            'UNC':'University of North Carolina at Chapel Hill',
            'UVa':'University of Virginia',
            'University of Minnesota':'University of Minnesota',
            'Berkeley':'University of California, Berkeley',
            'University of Colorado':'Regents of the University of Colorado, Boulder',
            'University of Texas':'University of Texas, Austin',
            'UCSD':'Regents of the University of California, San Diego',
            'University of Washington':'University of Washington',
            'UC Davis':'Regents of the University of California, Davis',
            'University of Utah':'University of Utah',
            'UC Santa Barbara':'Regents of the University of California, Santa Barbara',
            'SUNY Stony Brook':'SUNY Research Foundation, Stony Brook',
            'University of Michigan':'Regents of the University of Michigan',
            'UC Santa Cruz':'Regents of the University of California, Santa Cruz',
            'University of Iowa':'University of Iowa',
            'SUNY Buffalo':'SUNY Research Foundation, Buffalo State College',
            'University of Arizona':'Arizona Board of Regents',
            'The Ohio State University':'Ohio State University',
            'University of Pittsburgh':'University of Pittsburgh',
            'University of Oregon':'University of Oregon',}

'''
Loop through the AAU dictionary to get individual histories.
'''
aau_frames = {}
for key,value in aau_dict.items():
    institution = key
    df = aau_research[aau_research['Institution'] == value]
    history = df.groupby('YearAwarded')['AwardOutright'].sum().to_frame()
    aau_frames.update({institution:history})

'''
Loop through the aau_frames and make lines graphs
comparing OU to individual AAU institutions.
'''
for key,value in aau_frames.items():
    merged = pd.merge(OU,value,on='YearAwarded')
    plot = merged.rename(columns={'AwardOutright_x':'OU','AwardOutright_y':key}).plot.line(color={'OU':'#841617',key:'#168483'},figsize=(10,5),title=('OU vs. ' + str(key)),xlabel='Year Awarded',ylabel='Amount ($)')
    fig = plot.get_figure()
    fig.savefig('../plots/OU-' + str(key) + '.png')
    print(plot)
```

Here are the line graphs showing the NEH funding history of OU as compared to that of each public AAU institution.

![png](/assets/images/aau/output_66_3.png)

![png](/assets/images/aau/output_66_4.png)

![png](/assets/images/aau/output_66_5.png)

![png](/assets/images/aau/output_66_6.png)

![png](/assets/images/aau/output_66_7.png)

![png](/assets/images/aau/output_66_8.png)

![png](/assets/images/aau/output_66_9.png)

![png](/assets/images/aau/output_66_10.png)

![png](/assets/images/aau/output_66_11.png)

![png](/assets/images/aau/output_66_12.png)

![png](/assets/images/aau/output_66_13.png)

![png](/assets/images/aau/output_66_14.png)

![png](/assets/images/aau/output_66_15.png)

![png](/assets/images/aau/output_66_16.png)

![png](/assets/images/aau/output_66_17.png)

![png](/assets/images/aau/output_66_18.png)

![png](/assets/images/aau/output_66_19.png)

![png](/assets/images/aau/output_66_20.png)

![png](/assets/images/aau/output_66_21.png)

![png](/assets/images/aau/output_66_22.png)

![png](/assets/images/aau/output_66_23.png)

![png](/assets/images/aau/output_66_24.png)

![png](/assets/images/aau/output_66_25.png)

![png](/assets/images/aau/output_66_26.png)

![png](/assets/images/aau/output_66_27.png)

![png](/assets/images/aau/output_66_28.png)

![png](/assets/images/aau/output_66_29.png)

![png](/assets/images/aau/output_66_30.png)

![png](/assets/images/aau/output_66_31.png)

![png](/assets/images/aau/output_66_32.png)

![png](/assets/images/aau/output_66_33.png)

![png](/assets/images/aau/output_66_34.png)

![png](/assets/images/aau/output_66_35.png)

![png](/assets/images/aau/output_66_36.png)

![png](/assets/images/aau/output_66_37.png)

## More to Come

I have also done some Natural Language Processing work on the ProjectTitle field, just to see if I could identify any trends in projects that receive funding. I plan to write up that work in a future post.

Do you have questions you want to ask of this data? Please feel free to contact me at [huskey@ou.edu](mailto:huskey@ou.edu).

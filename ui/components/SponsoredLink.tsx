import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import MessageBoxLoading from './MessageBoxLoading';

interface KeywordCampaignComponentProps {
  queryKeyword: string;
}

const KeywordCampaignComponent: React.FC<KeywordCampaignComponentProps> = ({
  queryKeyword,
}) => {
  const [keywords, setKeywords] = useState<any[]>([]); // Palabras clave filtradas
  const [campaignId, setCampaignId] = useState<string | null>(null); // ID de la campaña asociada
  const [generatedLinks, setGeneratedLinks] = useState<string[]>([]);
  const url = 'https://app.crossroads.ai/api/v2/';
  const token = '7c68c616-a0d3-4c2e-a653-c649debfd541';
  const [loading, setLoading] = useState<boolean>(false); // Estado de carga

  useEffect(() => {
    const fetchKeywordsAndCampaign = async () => {
      setLoading(true);

      try {
        const stopwords = [
          'from',
          'the',
          'of',
          'and',
          'in',
          'on',
          'with',
          'at',
          'to',
          'for',
        ];
        const queryKeywordsArray = queryKeyword
          .trim()
          .split(/\s+/)
          .filter((word) => !stopwords.includes(word.toLowerCase()));

        const response = await fetch(`${url}keyword/lists/?key=${token}`);
        const data = await response.json();

        let filteredKeywords: any[] = [];
        let selectedCampaignId: string | null = null;

        data.forEach((list: any) => {
          list.keywords.forEach((keyword: any) => {
            if (
              queryKeywordsArray.some((query) => keyword.name.includes(query))
            ) {
              filteredKeywords.push(keyword);

              if (list.campaigns && list.campaigns.length > 0) {
                selectedCampaignId = list.campaigns[0].id;
              }
            }
          });
        });

        setKeywords(filteredKeywords);
        setCampaignId(selectedCampaignId);
      } catch (error) {
        console.error('Error campaing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKeywordsAndCampaign();
  }, [queryKeyword]);

  const replaceUrlParameters = (
    url: string,
    campaignId: string,
    keywordName: string,
  ) => {
    return url
      .replace('{{ad_title}}', keywordName)
      .replace('{title}', keywordName)
      .replace('{campaign_id}', campaignId)
      .replace('{site}', 'example_site')
      .replace('{site_id}', 'example_site_id')
      .replace('{click_id}', 'example_click_id')
      .replace('{{ob_click_id}}', 'example_ob_click_id')
      .replace('{{section_name}}', 'example_section_name')
      .replace('{{publisher_name}}', 'example_publisher_name')
      .replace('{{publisher_id}}', 'example_publisher_id')
      .replace('{{section_id}}', 'example_section_id');
  };

  // Función para llamar a la API get-traffic-source-urls y generar los enlaces sin duplicados
  const fetchTrafficSourceUrls = async (campaignId: string) => {
    try {
      const response = await fetch(
        `${url}get-traffic-source-urls/?key=${token}&campaign_ids=${campaignId}`,
      );
      const data = await response.json();

      let links: string[] = [];
      const campaign = data.campaigns[campaignId];

      if (campaign) {
        const allLinks = [...campaign.traffic_sources, ...campaign.naked_links];

        const uniqueLinks = Array.from(
          new Map(allLinks.map((source: any) => [source.id, source])).values(),
        );

        keywords.forEach((keyword, index) => {
          const randomIndex = Math.floor(Math.random() * uniqueLinks.length);
          const selectedLink = uniqueLinks[randomIndex];

          let url = selectedLink.url;
          url = replaceUrlParameters(url, campaignId, keyword.name);

          links.push(url);
        });
      }

      setGeneratedLinks(links);
    } catch (error) {
      console.error('Error al obtener las URLs de tráfico:', error);
    }
  };

  useEffect(() => {
    if (campaignId) {
      fetchTrafficSourceUrls(campaignId);
    }
  }, [campaignId]);

  return (
    <div>
      {loading ? (
        <>
          <MessageBoxLoading />
        </>
      ) : (
        <>
          {keywords.length > 0 && generatedLinks.length > 0 ? (
            <>
              <p className="text-center">Sponsored Link</p>
              <ul className="space-y-2">
                {keywords.slice(0, 4).map((keyword, index) => {
                  if (!keyword.name) {
                    console.error(
                      `Keyword at index ${index} does not have a name`,
                    );
                    return null;
                  }
                  return (
                    <Link
                      key={index}
                      href={generatedLinks[index]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-white bg-transparent border-2 border-white rounded-lg text-center hover:bg-white hover:text-black transition duration-200"
                    >
                      {keyword.name}
                    </Link>
                  );
                })}
              </ul>
            </>
          ) : (
            <></>
          )}
        </>
      )}
    </div>
  );
};

export default KeywordCampaignComponent;

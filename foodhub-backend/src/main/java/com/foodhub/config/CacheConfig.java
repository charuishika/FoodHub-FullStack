package com.foodhub.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import java.time.Duration;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching // turns on @Cacheable / @CacheEvict (Spring wraps beans in proxies)
public class CacheConfig {

    public static final String RESTAURANT_MENUS = "restaurantMenus";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(RESTAURANT_MENUS);
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofMinutes(5)) // entries expire 5 minutes after being cached
                .maximumSize(500));                      // at most 500 menus held in memory
        return cacheManager;
    }
}
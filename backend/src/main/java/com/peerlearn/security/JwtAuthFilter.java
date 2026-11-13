package com.peerlearn.security;

import com.peerlearn.entity.User;
import com.peerlearn.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtAuthFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String uri = request.getRequestURI();
        boolean isStatelessApiRoute = uri != null && uri.startsWith("/api/");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            boolean authenticatedFromJwt = false;

            if (jwtUtil.isTokenValid(token)) {
                String email = jwtUtil.extractEmail(token);
                String tokenId = jwtUtil.extractTokenId(token);

                if (email != null && !email.isBlank()) {
                    Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
                    if (userOpt.isPresent()) {
                        UserPrincipal principal = new UserPrincipal(userOpt.get());
                        UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(principal, tokenId, principal.getAuthorities());
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        authenticatedFromJwt = true;
                    }
                }
            }

            if (!authenticatedFromJwt) {
                SecurityContextHolder.clearContext();
            }
        } else if (isStatelessApiRoute) {
            // Never let a stale JSESSIONID cookie impersonate an account on stateless JWT API routes
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}

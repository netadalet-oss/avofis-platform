package org.larenlex.core;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.*;

/** Metadata-only W1 service map: original legal-card full texts are never loaded. */
public final class PublicServices {
    public record Service(String id,String groupId,String group,String title,String summary,
                          int formCount,int controlCount){}
    private final List<Service> items;
    private final Map<String,Service> byId;
    private final Map<String,List<Service>> byGroup;
    public PublicServices(InputStream input)throws IOException {
        if(input==null)throw new FileNotFoundException("public services list");
        try(var reader=new BufferedReader(new InputStreamReader(input,StandardCharsets.UTF_8))){
            List<Service> rows=new ArrayList<>();String header=reader.readLine();
            if(!"id\tgroup_id\tgroup_name\tname\tdescription\tform_count\tcontrol_count".equals(header))
                throw new IOException("invalid public service headers");
            String line;while((line=reader.readLine())!=null){
                String[] c=line.split("\\t",-1);if(c.length!=7)throw new IOException("invalid TSV row");
                if(!c[0].matches("P[1-5]/[1-9]\\d*"))throw new IOException("invalid ID");
                if(c[3].isBlank()||c[3].length()>150)throw new IOException("invalid public title");
                rows.add(new Service(c[0],c[1],c[2],c[3],c[4],Integer.parseInt(c[5]),Integer.parseInt(c[6])));
            }
            if(rows.size()!=554||rows.stream().map(Service::id).distinct().count()!=554)
                throw new IOException("554 verified services required");
            if(rows.stream().map(Service::groupId).distinct().count()!=17)throw new IOException("17 groups expected");
            items=List.copyOf(rows);
            byId=Collections.unmodifiableMap(rows.stream().collect(Collectors.toMap(Service::id,x->x)));
            byGroup=Collections.unmodifiableMap(rows.stream().collect(Collectors.groupingBy(Service::groupId,
                    LinkedHashMap::new,Collectors.toUnmodifiableList())));
        }
    }
    public List<Service> all(){return items;}
    public Optional<Service> find(String id){return Optional.ofNullable(byId.get(id));}
    public Map<String,List<Service>> groups(){return byGroup;}
    public List<Service> search(String q,String group,int limit){
        String query=q==null?"":q.toLowerCase(new Locale("tr","TR")).strip();
        return items.stream()
           .filter(s->group==null||group.isBlank()||s.groupId().equals(group))
           .filter(s->query.isEmpty()|| (s.title()+" "+s.group()+" "+s.summary()).toLowerCase(new Locale("tr","TR")).contains(query))
           .limit(Math.min(554,Math.max(1,limit))).toList();
    }
}
